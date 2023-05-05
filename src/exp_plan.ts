import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult, clickEventType } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-plan")!;

const paramTimes1El: HTMLInputElement = expEl.querySelector("#param-times1")!;
const paramTimes2El: HTMLInputElement = expEl.querySelector("#param-times2")!;
const paramTimes3El: HTMLInputElement = expEl.querySelector("#param-times3")!;
const paramMICEl: HTMLInputElement = expEl.querySelector("#param-mic")!;

const buttonEl = <HTMLInputElement>document.getElementById("btn-plan")!;
buttonEl.addEventListener(clickEventType, exp_plan, false);


export async function exp_plan() {
    const start = 0.0;
    const end = 24.0;
    const amt = 250.0 * 3;

    const times1 = Number(paramTimes1El.value);
    const times2 = Number(paramTimes2El.value);
    const times3 = Number(paramTimes3El.value);
    const mic = Number(paramMICEl.value);


    const n = 3;
    const times = [times1, times2, times3];
    const result: SimResult[] = [];

    for (let i = 0; i < n; i++) {
        result[i] = await invoke("admin_repeat", {
            start:start,
            end: end,
            isIv: false,
            ka: ConstVal.KApo_Amx,
            cl: ConstVal.CL_Amx,
            vc: ConstVal.Vd_Amx,
            k12: 0.0,
            k21: 0.0,
            amt: amt / times[i],
            f: ConstVal.F_Amx,
            ii: (end - start) / times[i],
            addl: times[i] - 1,
            div: 200.0, minstep: 0.1
        });
    }


    // plot
    const data = [
        {
            x: result[0][0],
            y: result[0][1],
            mode: "lines" as any,
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result[1][0],
            y: result[1][1],
            mode: "lines" as any,
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result[2][0],
            y: result[2][1],
            mode: "lines" as any,
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: [start, end],
            y: [mic, mic],
            mode: "lines" as any,
            type: "scattergl" as Plotly.PlotType,
            line: {
                color: "black",
                dash: "dot"
            } as any
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
            title: ConstVal.ylab_Amx,
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
    Plotly.react("plot-plan", data, layout, {staticPlot: true});
}

