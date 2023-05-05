import { sprintf } from "sprintf-js";
import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult, clickEventType, makeTable } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-dysfunctionB")!;

const paramCl1El: HTMLInputElement = expEl.querySelector("#param-cl1")!;
const paramCl2El: HTMLInputElement = expEl.querySelector("#param-cl2")!;
const paramCl3El: HTMLInputElement = expEl.querySelector("#param-cl3")!;
const paramCl4El: HTMLInputElement = expEl.querySelector("#param-cl4")!;
const paramCl5El: HTMLInputElement = expEl.querySelector("#param-cl5")!;
const table1El: HTMLTableElement = document.querySelector("#table-dysfunctionB1")!;
const table2El: HTMLTableElement = document.querySelector("#table-dysfunctionB2")!;

const buttonEl = <HTMLInputElement>document.getElementById("btn-dysfunctionB")!;
buttonEl.addEventListener(clickEventType, exp_dysfunctionB, false);


export async function exp_dysfunctionB() {
    const start = 0.0;
    const end1 = 120.0;
    const end2 = 48.0;
    const amt = 200;

    const n = 3;
    const cl1 = [
        Number(paramCl1El.value),
        Number(paramCl2El.value),
        Number(paramCl3El.value)
    ];
    const cl2 = [
        Number(paramCl1El.value),
        Number(paramCl4El.value),
        Number(paramCl5El.value)
    ];
    const minsteps = [0.05, 0.05, 0.05];

    const result1: SimResult[] = [];
    const result2: SimResult[] = [];
    const second1: number[][] = [];
    const second2: number[][] = [];
    const hl1: number[] = [];
    const hl2: number[] = [];

    for (let i = 0; i < n; i++) {
        result1[i] = await invoke("admin_borus", {
            start: start,
            end: end1,
            isIv: false,
            ka: ConstVal.KApo_Theo,
            cl: cl1[i],
            vc: ConstVal.Vd_Theo,
            k12: 0.0,
            k21: 0.0,
            amt: amt,
            f: ConstVal.F_Theo,
            div: 200.0, minstep: minsteps[i],
        });

        result2[i] = await invoke("admin_borus", {
            start: start,
            end: end2,
            isIv: false,
            ka: ConstVal.KApo_Theo,
            cl: cl2[i],
            vc: ConstVal.Vd_Theo,
            k12: 0.0,
            k21: 0.0,
            amt: amt,
            f: ConstVal.F_Theo,
            div: 200.0, minstep: minsteps[i],
        });

        second1[i] = await invoke("get_cmax_tmax_auc", {
            time: result1[i][0],
            conc: result1[i][1]
        });

        second2[i] = await invoke("get_cmax_tmax_auc", {
            time: result2[i][0],
            conc: result2[i][1]
        });

        hl1[i] = await invoke("get_halftime", {
            ka: ConstVal.KApo_Theo,
            cl: cl1[i],
            vc: ConstVal.Vd_Theo,
            k12: 0.0,
            k21: 0.0
        });

        hl2[i] = await invoke("get_halftime", {
            ka: ConstVal.KApo_Theo,
            cl: cl2[i],
            vc: ConstVal.Vd_Theo,
            k12: 0.0,
            k21: 0.0
        });
    }


    // table
    const header = ["状態", "CL", "Cmax", "Tmax", "AUC", "t1/2"];
    const condition1 = ["肝100%", "肝50%", "肝0%"];
    const condition2 = ["腎100%", "腎50%", "腎0%"];
    const contents1: string[][] = [];
    const contents2: string[][] = [];

    for (let i = 0; i < n; i++) {
        contents1[i] = [
            condition1[i],
            sprintf("%.1f", cl1[i]),
            sprintf("%.1f", second1[i][0]),
            sprintf("%.1f", second1[i][1]),
            sprintf("%.1f", second1[i][2]),
            sprintf("%.1f", hl1[i])
        ];

        contents2[i] = [
            condition2[i],
            sprintf("%.1f", cl2[i]),
            sprintf("%.1f", second2[i][0]),
            sprintf("%.2f", second2[i][1]),
            sprintf("%.1f", second2[i][2]),
            sprintf("%.1f", hl2[i])
        ];
    }

    makeTable(table1El, header, contents1);
    makeTable(table2El, header, contents2);


    // plot
    const data1 = [
        {
            x: result1[0][0],
            y: result1[0][1],
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result1[1][0],
            y: result1[1][1],
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result1[2][0],
            y: result1[2][1],
            type: "scattergl" as Plotly.PlotType
        }
    ];

    const data2 = [
        {
            x: result2[0][0],
            y: result2[0][1],
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result2[1][0],
            y: result2[1][1],
            type: "scattergl" as Plotly.PlotType
        },
        {
            x: result2[2][0],
            y: result2[2][1],
            type: "scattergl" as Plotly.PlotType
        }
    ];

    const layout1 = {
        title: "Liver dysfunction",
        xaxis: {
            title: ConstVal.xlab,
            showgrid: false,
            zeroline: true
        },
        yaxis: {
            title: ConstVal.ylab_Theo,
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

    const layout2 = {
        title: "Kidney dysfunction",
        xaxis: {
            title: ConstVal.xlab,
            showgrid: false,
            zeroline: true
        },
        yaxis: {
            title: ConstVal.ylab_Theo,
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
    Plotly.react('plot-dysfunctionB1', data1, layout1, {staticPlot: true});
    Plotly.react('plot-dysfunctionB2', data2, layout2, {staticPlot: true});
}

