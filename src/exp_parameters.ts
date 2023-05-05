import { sprintf } from "sprintf-js";
import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-parameters")!;

const paramKaEl: HTMLInputElement = expEl.querySelector("#param-ka")!;
const paramClEl: HTMLInputElement = expEl.querySelector("#param-cl")!;
const paramVcEl: HTMLInputElement = expEl.querySelector("#param-vc")!;
const paramFEl: HTMLInputElement = expEl.querySelector("#param-f")!;
const paramLogEl: HTMLInputElement = expEl.querySelector("#param-isLog")!;

const dispKaEl: HTMLElement = expEl.querySelector("#value-ka")!;
const dispClEl: HTMLElement = expEl.querySelector("#value-cl")!;
const dispVcEl: HTMLElement = expEl.querySelector("#value-vc")!;
const dispFEl: HTMLElement = expEl.querySelector("#value-f")!;


expEl.querySelectorAll<HTMLInputElement>("[id^='param']")
.forEach((element) => {
    element.addEventListener("input", exp_parameters);
});


export async function exp_parameters() {
    const start = 0.0;
    const end = 6.0;

    const ka = Number(paramKaEl.value);
    const cl = Number(paramClEl.value);
    const vc = Number(paramVcEl.value);
    const f = Number(paramFEl.value);

    dispKaEl.textContent = sprintf("%.1f (1/h)", ka);
    dispClEl.textContent = sprintf("%.1f (L/h)", cl);
    dispVcEl.textContent = sprintf("%.1f (L)", vc);
    dispFEl.textContent = sprintf("%.2f", f);


    const n = 3;
    const isIvs = [true, false, false];
    const kas = [0.0, 8.0, ka];
    const fs = [1.0, 1.0, f];
    const minsteps = [0.1, 0.02, 0.02];
    const amt = 100.0;

    const result: SimResult[] = [];
    const second: number[] = [];

    for (let i = 0; i < n; i++) {
        result[i] = await invoke("admin_borus", {
            start: start,
            end: end,
            isIv: isIvs[i],
            ka: kas[i],
            cl: cl,
            vc: vc,
            k12: 0.0,
            k21: 0.0,
            amt: amt,
            f: fs[i],
            div: 200.0, minstep: minsteps[i],
        });

        second[i] = await invoke("get_cmax_tmax_auc", {
            time: result[i][0],
            conc: result[i][1]
        });
    }


    // plot
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

    const data = [
        {
            x: result[0][0],
            y: result[0][1],
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result[1][0],
            y: result[1][1],
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result[2][0],
            y: result[2][1],
            type: "scattergl" as Plotly.PlotType
        }
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
    Plotly.react("plot-parameters", data, layout, {staticPlot: true});
}

