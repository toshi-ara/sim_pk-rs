import { sprintf } from "sprintf-js";
import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-loading")!;

const paramFirstEl: HTMLInputElement = expEl.querySelector("#param-1st")!;
const paramKaEl: HTMLInputElement = expEl.querySelector("#param-ka")!;
const paramClEl: HTMLInputElement = expEl.querySelector("#param-cl")!;
const paramVcEl: HTMLInputElement = expEl.querySelector("#param-vc")!;

const dispFirstEl: HTMLElement = expEl.querySelector("#value-1st")!;
const dispKaEl: HTMLElement = expEl.querySelector("#value-ka")!;
const dispClEl: HTMLElement = expEl.querySelector("#value-cl")!;
const dispVcEl: HTMLElement = expEl.querySelector("#value-vc")!;


expEl.querySelectorAll<HTMLInputElement>("[id^='param']")
.forEach((element) => {
    element.addEventListener("input", exp_loading);
});


export async function exp_loading() {
    const start = 0.0;
    const end = 60.0;
    const amt = 200.0;
    const ii = 6;
    const addl = Math.trunc(end / ii - 1);

    const firstAmt = paramFirstEl.value;
    const ka = paramKaEl.value;
    const cl = paramClEl.value;
    const vc = paramVcEl.value;

    dispFirstEl.textContent = sprintf("%d", firstAmt);
    dispKaEl.textContent = sprintf("%.1f (1/h)", ka);
    dispClEl.textContent = sprintf("%.1f (L/h)", cl);
    dispVcEl.textContent = sprintf("%.1f (L)", vc);

    let isIv: boolean;
    if (Number(ka) == 0.0) {
        isIv = true;
    } else {
        isIv = false;
    }


    const result1: SimResult = await invoke("admin_repeat", {
        start: start,
        end: end,
        isIv: isIv,
        ka: Number(ka),
        cl: Number(cl),
        vc: Number(vc),
        k12: 0.0,
        k21: 0.0,
        amt: amt,
        f: 1.0,
        ii: ii,
        addl: addl,
        div: 200.0, minstep: 0.1,
    });

    const result2: SimResult = await invoke("admin_loading", {
        start: start,
        end: end,
        isIv: isIv,
        ka: Number(ka),
        cl: Number(cl),
        vc: Number(vc),
        k12: 0.0,
        k21: 0.0,
        amt1: Number(firstAmt),
        amt2: amt,
        f: 1.0,
        ii: ii,
        addl: addl,
        div: 200.0, minstep: 0.05
    });

    // plot
    const data = [
        {
            x: result1[0],
            y: result1[1],
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result2[0],
            y: result2[1],
            type: "scattergl" as Plotly.PlotType
        },
    ];

    const layout = {
        title: "Repeated administration",
        xaxis: {
            title: ConstVal.xlab,
            showgrid: false,
            zeroline: true
        },
        yaxis: {
            title: ConstVal.ylab,
            rangemode: "tozero" as any,
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
    Plotly.react("plot-loading", data, layout, {staticPlot: true});
}

