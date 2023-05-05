import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult, clickEventType } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-Vd")!;

const paramTimes1El: HTMLInputElement = expEl.querySelector("#param-times1")!;
const paramTimes2El: HTMLInputElement = expEl.querySelector("#param-times2")!;
const paramTimes3El: HTMLInputElement = expEl.querySelector("#param-times3")!;
const paramDaysEl: HTMLInputElement = expEl.querySelector("#param-days")!;

const buttonEl = <HTMLInputElement>document.getElementById("btn-Vd")!;
buttonEl.addEventListener(clickEventType, exp_Vd, false);


export async function exp_Vd() {
    const times1 = Number(paramTimes1El.value);
    const times2 = Number(paramTimes2El.value);
    const times3 = Number(paramTimes3El.value);
    const days = Number(paramDaysEl.value);

    const start = 0.0;
    const end = days * 24.0;
    const amt = 5000.0; // (μg)


    const n = 3;
    const times = [times1, times2, times3];
    const result: SimResult[] = [];

    for (let i = 0; i < n; i++) {
        result[i] = await invoke("admin_repeat", {
            start:start,
            end: end,
            isIv: false,
            ka: ConstVal.KApo_Dzp,
            cl: ConstVal.CL_Dzp,
            vc: ConstVal.Vd_Dzp * times[i],
            k12: 0.0,
            k21: 0.0,
            amt: amt,
            f: ConstVal.F_Dzp,
            ii: 24,
            addl: days - 1,
            div: 200.0, minstep: 0.1
        });
    }


    // plot
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
        title: "Repeated administration",
        xaxis: {
            title: ConstVal.xlab,
            rangemode: "tozero" as any,
            showgrid: false,
            zeroline: true
        },
        yaxis: {
            title: ConstVal.ylab_Dzp,
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
    Plotly.react("plot-Vd", data, layout, {staticPlot: true});
}

