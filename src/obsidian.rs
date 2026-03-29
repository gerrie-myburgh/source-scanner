use wasm_bindgen::prelude::*;

/// External bindings to Obsidian JavaScript API
/// 
/// This module provides Rust bindings to the Obsidian plugin API via `wasm_bindgen`.
/// These types and functions allow the WebAssembly module to interact with Obsidian's
/// plugin system.
#[wasm_bindgen(module = "obsidian")]
extern "C" {
    /// Represents an Obsidian plugin instance
    pub type Plugin;

    /// Add a command to the plugin
    /// 
    /// # Arguments
    /// * `this` - The plugin instance
    /// * `command` - JavaScript value representing the command configuration
    #[wasm_bindgen(structural, method)]
    pub fn addCommand(this: &Plugin, command: JsValue);

    /// Represents an Obsidian notice (notification)
    pub type Notice;

    /// Create a new notice with the given message
    /// 
    /// # Arguments
    /// * `message` - The message to display in the notice
    #[wasm_bindgen(constructor)]
    pub fn new(message: &str) -> Notice;
}
