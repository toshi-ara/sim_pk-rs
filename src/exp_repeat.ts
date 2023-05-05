import { sprintf } from "sprintf-js";
import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-repeat")!;

const paramAmtEl: HTMLInputElement = expEl.querySelector("#param-amt")!;
const paramIntervalEl: HTMLInputElement = expEl.querySelector("#param-interval")!;
const paramHlEl: HTMLInputElement = expEl.querySelector("#param-hl")!;

const dispAmtEl: HTMLElement = expEl.querySelector("#value-amt")!;
const dispIntervalEl: HTMLElement = expEl.querySelector("#value-interval")!;
const dispHlEl: HTMLElement = expEl.querySelector("#value-hl")!;


expEl.querySelectorAll<HTMLInputElement>("[id^='param']")
.forEach((element) => {
    element.addEventListener("input", exp_repeat);
});


export async function exp_repeat() {
    const amt = Number(paramAmtEl.value);
    const interval = Number(paramIntervalEl.value);
    const hl = Number(paramHlEl.value);

    dispAmtEl.textContent = sprintf("%d (mg)", amt);
    dispIntervalEl.textContent = sprintf("%.1f (h)", interval);
    dispHlEl.textContent = sprintf("%.1f (h)", hl);

    const low = 20;
    const high = 35;

    const ka = 2;
    const vc = 10;
    const addl = 9;

    const start = 0.0;
    const end = interval * (addl + 1);
    const cl = Math.log(2) * vc / hl;


    const result: SimResult = await invoke("admin_repeat", {
        start: start,
        end: end,
        isIv: false,
        ka: ka,
        cl: cl,
        vc: vc,
        k12: 0.0,
        k21: 0.0,
        amt: amt,
        f: 1.0,
        ii: interval,
        addl: addl,
        div: 200.0, minstep: 0.1,
    });


    // plot
    const data = [
        {
            x: result[0],
            y: result[1],
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: [start, end],
            y: [low, low],
            mode: "lines" as any,
            type: "scattergl" as Plotly.PlotType,
            line: {
                color: "black",
                dash: "dot"
            } as any
        },
        {
            x: [start, end],
            y: [high, high],
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
    Plotly.react("plot-repeat", data, layout, {staticPlot: true});
}

