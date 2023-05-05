// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ode;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
                        admin_borus,
                        admin_infusion,
                        admin_infusion,
                        admin_repeat,
                        admin_loading,
                        get_cmax_tmax_auc,
                        get_halftime,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


// top level functions
#[tauri::command]
fn admin_borus(start: f64, end: f64,
               is_iv: bool,
               ka: f64, cl: f64, vc: f64, k12: f64, k21: f64,
               amt: f64, f: f64,
               div: f64, minstep: f64) -> ode::SimResult {
    ode::admin_borus(start, end, is_iv, ka, cl, vc, k12, k21,
                     amt, f, div, minstep)
}

#[tauri::command]
fn admin_infusion(start: f64, end: f64,
                  cl: f64, vc: f64, k12: f64, k21: f64,
                  amt: f64, duration: f64,
                  div: f64, minstep: f64) -> ode::SimResult {
    ode::admin_infusion(start, end, cl, vc, k12, k21,
                        amt, duration, div, minstep)
}

#[tauri::command]
fn admin_repeat(start: f64, end: f64,
               is_iv: bool,
                ka: f64, cl: f64, vc: f64, k12: f64, k21: f64,
                amt: f64, f: f64,
                ii: f64, addl: usize,
                div: f64, minstep: f64) -> ode::SimResult {
    ode::admin_repeat(start, end, is_iv, ka, cl, vc, k12, k21,
                      amt, f, ii, addl, div, minstep)
}

#[tauri::command]
fn admin_loading(start: f64, end: f64,
               is_iv: bool,
                 ka: f64, cl: f64, vc: f64, k12: f64, k21: f64,
                 amt1: f64, amt2: f64, f: f64,
                 ii: f64, addl: usize,
                 div: f64, minstep: f64) -> ode::SimResult {
    ode::admin_loading(start, end, is_iv, ka, cl, vc, k12, k21,
                       amt1, amt2, f, ii, addl, div, minstep)
}

#[tauri::command]
fn get_cmax_tmax_auc(time: Vec<f64>, conc: Vec<f64>) -> (f64, f64, f64) {
    ode::get_cmax_tmax_auc(&time, &conc)
}

#[tauri::command]
fn get_halftime(ka: f64, cl: f64, vc: f64, k12: f64, k21: f64) -> Vec<f64> {
    let param = ode::Param::new(ka, cl, vc, k12, k21, 0.0);
    param.calc_halftime()
}
