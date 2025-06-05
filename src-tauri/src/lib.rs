mod image_processor;

use image_processor::{
    crop_image, resize_image, convert_image_format, compare_images, get_image_info,
    CropParams, ResizeParams, ConvertParams, ProcessedImage, ImageInfo
};
use tauri::command;

#[command]
async fn crop_image_command(base64_data: String, params: CropParams) -> Result<ProcessedImage, String> {
    crop_image(&base64_data, params).map_err(|e| e.to_string())
}

#[command]
async fn resize_image_command(base64_data: String, params: ResizeParams) -> Result<ProcessedImage, String> {
    resize_image(&base64_data, params).map_err(|e| e.to_string())
}

#[command]
async fn convert_image_command(base64_data: String, params: ConvertParams) -> Result<ProcessedImage, String> {
    convert_image_format(&base64_data, params).map_err(|e| e.to_string())
}

#[command]
async fn compare_images_command(base64_data1: String, base64_data2: String) -> Result<ProcessedImage, String> {
    compare_images(&base64_data1, &base64_data2).map_err(|e| e.to_string())
}

#[command]
async fn get_image_info_command(base64_data: String) -> Result<ImageInfo, String> {
    get_image_info(&base64_data).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        crop_image_command,
        resize_image_command,
        convert_image_command,
        compare_images_command,
        get_image_info_command
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
