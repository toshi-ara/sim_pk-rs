import { sprintf } from "sprintf-js";
import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-infusion")!;

const paramDurationEl: HTMLInputElement = expEl.querySelector("#param-duration")!;
const paramAmtEl: HTMLInputElement = expEl.querySelector("#param-amt")!;
const paramClEl: HTMLInputElement = expEl.querySelector("#param-cl")!;
const paramVcEl: HTMLInputElement = expEl.querySelector("#param-vc")!;
const paramK12El: HTMLInputElement = expEl.querySelector("#param-k12")!;
const paramK21El: HTMLInputElement = expEl.querySelector("#param-k21")!;

const dispDurationEl: HTMLElement = expEl.querySelector("#value-duration")!;
const dispAmtEl: HTMLElement = expEl.querySelector("#value-amt")!;
const dispClEl: HTMLElement = expEl.querySelector("#value-cl")!;
const dispVcEl: HTMLElement = expEl.querySelector("#value-vc")!;
const dispK12El: HTMLElement = expEl.querySelector("#value-k12")!;
const dispK21El: HTMLElement = expEl.querySelector("#value-k21")!;


expEl.querySelectorAll<HTMLInputElement>("[id^='param']")
.forEach(function(element) {
    element.addEventListener("input", exp_infusion);
});;


export async function exp_infusion() {
    const start = 0.0;
    const end = 8.0;

    const duration =  paramDurationEl.value;
    const amt =  paramAmtEl.value;
    const cl =  paramClEl.value;
    const vc =  paramVcEl.value;
    const k12 =  paramK12El.value;
    const k21 =  paramK21El.value;

    dispDurationEl.textContent = sprintf("%.1f (h)", duration);
    dispAmtEl.textContent = sprintf("%.0f (mg)", amt);
    dispClEl.textContent = sprintf("%.1f (L/h)", cl);
    dispVcEl.textContent = sprintf("%.1f (L)", vc);
    dispK12El.textContent = sprintf("%.1f (1/h)", k12);
    dispK21El.textContent = sprintf("%.1f (1/h)", k21);

    const result1: SimResult = await invoke("admin_borus", {
        start: start,
        end: end,
        isIv: true,
        ka: 0.0,
        cl: Number(cl),
        vc: Number(vc),
        k12: Number(k12),
        k21: Number(k21),
        amt: 100.0,
        f: 1.0,
        div: 200.0, minstep: 0.05,
    });

    const result2: SimResult = await invoke("admin_infusion", {
        start: start,
        end: end,
        cl: Number(cl),
        vc: Number(vc),
        k12: Number(k12),
        k21: Number(k21),
        amt: Number(amt),
        duration: Number(duration),
        div: 200.0, minstep: 0.02
    });
    if (result1 == null || result2 == null) {
        return;
    }

    const data = [
        {
            x: result1[0],
            y: result1[1],
            type: "scatter" as Plotly.PlotType
        },
        {
            x: result2[0],
            y: result2[1],
            type: "scatter" as Plotly.PlotType
        },
    ];

    const layout = {
        title: "Infusion",
        xaxis: {
            title: ConstVal.xlab,
            showgrid: false,
            zeroline: true
        },
        yaxis: {
            title: ConstVal.ylab,
            range: [0, 12],
            showline: true
        },
        font: {
            size: 16
        },
        showlegend: false,
        autosize: false,
        width: ConstVal.Width,
        height:ConstVal.Height
    };
    Plotly.react('plot-infusion', data, layout, {staticPlot: true});
}

