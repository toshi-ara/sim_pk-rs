import { exit } from "@tauri-apps/api/process";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"

import { exp_compmodel } from "./exp_compmodel";
import { exp_parameters } from "./exp_parameters";
import { exp_repeat } from "./exp_repeat";
import { exp_loading } from "./exp_loading";
import { exp_infusion } from "./exp_infusion";
import "./exp_administration";
import "./exp_plan";
import "./exp_dysfunctionA";
import "./exp_dysfunctionB";
import "./exp_Vd";


window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn_quit")!
        .addEventListener("click", () => {
        exit(0);
    });

    // 起動時にデフォルト値で図を描画
    exp_compmodel();
    exp_parameters();
    exp_repeat();
    exp_loading();
    exp_infusion();
});

