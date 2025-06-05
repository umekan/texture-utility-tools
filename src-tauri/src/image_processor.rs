use anyhow::Result;
use image::{DynamicImage, ImageFormat};
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use base64::{Engine as _, engine::general_purpose};

#[derive(Debug, Serialize, Deserialize)]
pub struct CropParams {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResizeParams {
    pub width: u32,
    pub height: u32,
    pub maintain_aspect_ratio: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConvertParams {
    pub format: String, // "png", "jpg", "webp", etc.
    pub quality: Option<u8>, // for jpg
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessedImage {
    pub data: String, // base64 encoded
    pub format: String,
    pub width: u32,
    pub height: u32,
    pub size_bytes: usize,
}

pub fn decode_image_from_base64(base64_data: &str) -> Result<DynamicImage> {
    let data = general_purpose::STANDARD.decode(base64_data)?;
    let img = image::load_from_memory(&data)?;
    Ok(img)
}

pub fn encode_image_to_base64(img: &DynamicImage, format: ImageFormat) -> Result<String> {
    let mut buffer = Vec::new();
    let mut cursor = Cursor::new(&mut buffer);
    img.write_to(&mut cursor, format)?;
    Ok(general_purpose::STANDARD.encode(&buffer))
}

pub fn crop_image(base64_data: &str, params: CropParams) -> Result<ProcessedImage> {
    let img = decode_image_from_base64(base64_data)?;
    
    // Validate crop parameters
    if params.x + params.width > img.width() || params.y + params.height > img.height() {
        return Err(anyhow::anyhow!("Crop parameters exceed image dimensions"));
    }
    
    let cropped = img.crop_imm(params.x, params.y, params.width, params.height);
    let format = ImageFormat::Png;
    let data = encode_image_to_base64(&cropped, format)?;
    let size_bytes = data.len();
    
    Ok(ProcessedImage {
        data,
        format: "png".to_string(),
        width: cropped.width(),
        height: cropped.height(),
        size_bytes,
    })
}

pub fn resize_image(base64_data: &str, params: ResizeParams) -> Result<ProcessedImage> {
    let img = decode_image_from_base64(base64_data)?;
    
    let (new_width, new_height) = if params.maintain_aspect_ratio {
        let aspect_ratio = img.width() as f64 / img.height() as f64;
        let target_aspect_ratio = params.width as f64 / params.height as f64;
        
        if aspect_ratio > target_aspect_ratio {
            // Image is wider than target
            let new_width = params.width;
            let new_height = (new_width as f64 / aspect_ratio).round() as u32;
            (new_width, new_height)
        } else {
            // Image is taller than target
            let new_height = params.height;
            let new_width = (new_height as f64 * aspect_ratio).round() as u32;
            (new_width, new_height)
        }
    } else {
        (params.width, params.height)
    };
    
    let resized = img.resize(new_width, new_height, image::imageops::FilterType::Lanczos3);
    let format = ImageFormat::Png;
    let data = encode_image_to_base64(&resized, format)?;
    let size_bytes = data.len();
    
    Ok(ProcessedImage {
        data,
        format: "png".to_string(),
        width: resized.width(),
        height: resized.height(),
        size_bytes,
    })
}

pub fn convert_image_format(base64_data: &str, params: ConvertParams) -> Result<ProcessedImage> {
    let img = decode_image_from_base64(base64_data)?;
    
    let format = match params.format.to_lowercase().as_str() {
        "png" => ImageFormat::Png,
        "jpg" | "jpeg" => ImageFormat::Jpeg,
        "webp" => ImageFormat::WebP,
        "bmp" => ImageFormat::Bmp,
        "gif" => ImageFormat::Gif,
        _ => return Err(anyhow::anyhow!("Unsupported format: {}", params.format)),
    };
    
    let data = if format == ImageFormat::Jpeg {
        // For JPEG, we might want to handle quality
        encode_image_to_base64(&img, format)?
    } else {
        encode_image_to_base64(&img, format)?
    };
    let size_bytes = data.len();
    
    Ok(ProcessedImage {
        data,
        format: params.format.to_lowercase(),
        width: img.width(),
        height: img.height(),
        size_bytes,
    })
}

pub fn compare_images(base64_data1: &str, base64_data2: &str) -> Result<ProcessedImage> {
    let img1 = decode_image_from_base64(base64_data1)?;
    let img2 = decode_image_from_base64(base64_data2)?;
    
    // Resize images to the same size for comparison
    let max_width = img1.width().max(img2.width());
    let max_height = img1.height().max(img2.height());
    
    let img1_resized = img1.resize_exact(max_width, max_height, image::imageops::FilterType::Lanczos3);
    let img2_resized = img2.resize_exact(max_width, max_height, image::imageops::FilterType::Lanczos3);
    
    // Create difference image
    let img1_rgb = img1_resized.to_rgb8();
    let img2_rgb = img2_resized.to_rgb8();
    
    let mut diff_buffer = Vec::new();
    for (p1, p2) in img1_rgb.pixels().zip(img2_rgb.pixels()) {
        let r_diff = (p1[0] as i16 - p2[0] as i16).abs() as u8;
        let g_diff = (p1[1] as i16 - p2[1] as i16).abs() as u8;
        let b_diff = (p1[2] as i16 - p2[2] as i16).abs() as u8;
        
        // Enhance differences for visibility
        let enhanced_r = if r_diff > 10 { 255 } else { r_diff * 10 };
        let enhanced_g = if g_diff > 10 { 255 } else { g_diff * 10 };
        let enhanced_b = if b_diff > 10 { 255 } else { b_diff * 10 };
        
        diff_buffer.extend_from_slice(&[enhanced_r, enhanced_g, enhanced_b]);
    }
    
    let diff_img = image::RgbImage::from_raw(max_width, max_height, diff_buffer)
        .ok_or_else(|| anyhow::anyhow!("Failed to create difference image"))?;
    
    let dynamic_diff = DynamicImage::ImageRgb8(diff_img);
    let format = ImageFormat::Png;
    let data = encode_image_to_base64(&dynamic_diff, format)?;
    let size_bytes = data.len();
    
    Ok(ProcessedImage {
        data,
        format: "png".to_string(),
        width: max_width,
        height: max_height,
        size_bytes,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageInfo {
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub size_bytes: usize,
}

pub fn get_image_info(base64_data: &str) -> Result<ImageInfo> {
    let data = general_purpose::STANDARD.decode(base64_data)?;
    let img = image::load_from_memory(&data)?;
    
    // Try to determine format from the image data
    let format = image::guess_format(&data)
        .map(|f| match f {
            ImageFormat::Png => "png",
            ImageFormat::Jpeg => "jpg",
            ImageFormat::WebP => "webp",
            ImageFormat::Gif => "gif",
            ImageFormat::Bmp => "bmp",
            _ => "unknown",
        })
        .unwrap_or("unknown")
        .to_string();
    
    Ok(ImageInfo {
        width: img.width(),
        height: img.height(),
        format,
        size_bytes: data.len(),
    })
}