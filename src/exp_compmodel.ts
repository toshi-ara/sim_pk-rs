import { sprintf } from "sprintf-js";
import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-compmodel")!;

const paramK12El: HTMLInputElement = expEl.querySelector("#param-k12")!;
const paramK21El: HTMLInputElement = expEl.querySelector("#param-k21")!;
const paramKaEl: HTMLInputElement = expEl.querySelector("#param-ka")!;
const paramClEl: HTMLInputElement = expEl.querySelector("#param-cl")!;
const paramVcEl: HTMLInputElement = expEl.querySelector("#param-vc")!;
const paramLogEl: HTMLInputElement = expEl.querySelector("#param-isLog")!;

const dispK12El: HTMLElement = expEl.querySelector("#value-k12")!;
const dispK21El: HTMLElement = expEl.querySelector("#value-k21")!;
const dispKaEl: HTMLElement = expEl.querySelector("#value-ka")!;
const dispClEl: HTMLElement = expEl.querySelector("#value-cl")!;
const dispVcEl: HTMLElement = expEl.querySelector("#value-vc")!;


expEl.querySelectorAll<HTMLInputElement>("[id^='param']")
.forEach((element) => {
    element.addEventListener("input", exp_compmodel);
});


export async function exp_compmodel() {
    const start = 0.0;
    const end = 8.0;

    const k12 = paramK12El.value;
    const k21 = paramK21El.value;
    const ka = paramKaEl.value;
    const cl = paramClEl.value;
    const vc = paramVcEl.value;

    dispK12El.textContent = sprintf("%.1f (1/h)", k12);
    dispK21El.textContent = sprintf("%.1f (1/h)", k21);
    dispKaEl.textContent = sprintf("%.1f (1/h)", ka);
    dispClEl.textContent = sprintf("%.1f (L/h)", cl);
    dispVcEl.textContent = sprintf("%.1f (L)", vc);

    let isIv: boolean;
    if (Number(ka) == 0.0) {
        isIv = true;
    } else {
        isIv = false;
    }

    // y-axis type
    let yaxisrange: number[];
    let yaxistype: string;

    if (paramLogEl.checked) {
        yaxisrange = [-1.2, 1.5];
        yaxistype = "log";
    } else {
        yaxisrange = [0, 12];
        yaxistype = "linear";
    }


    const result1: SimResult = await invoke("admin_borus", {
        start: start,
        end: end,
        isIv: isIv,
        ka: Number(ka),
        cl: Number(cl),
        vc: Number(vc),
        k12: 0.0,
        k21: 0.0,
        amt: 100.0,
        f: 1.0,
        div: 200.0, minstep: 0.02,
    });

    const result2: SimResult = await invoke("admin_borus", {
        start: start,
        end: end,
        isIv: isIv,
        ka: Number(ka),
        cl: Number(cl),
        vc: Number(vc),
        k12: Number(k12),
        k21: Number(k21),
        amt: 100.0,
        f: 1.0,
        div: 200.0, minstep: 0.02
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
        title: "Borus administration",
        xaxis: {
            title: ConstVal.xlab,
            showgrid: false,
            zeroline: true
        },
        yaxis: {
            title: ConstVal.ylab,
            range: yaxisrange,
            type: yaxistype as any,
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
    Plotly.react("plot-compmodel", data, layout, {staticPlot: true});
}

