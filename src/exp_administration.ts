import { sprintf } from "sprintf-js";
import { invoke } from "@tauri-apps/api/tauri";
import Plotly from "plotly.js-basic-dist-min";
import * as ConstVal from "./ConstVal";
import { SimResult, clickEventType, makeTable } from "./common_function";

const expEl: HTMLElement = document.getElementById("elem-administration")!;

const paramKaPoEl: HTMLInputElement = expEl.querySelector("#param-ka-po")!;
const paramKaImEl: HTMLInputElement = expEl.querySelector("#param-ka-im")!;
const paramAmtEl: HTMLInputElement = expEl.querySelector("#param-amt")!;
const tableEl: HTMLTableElement = expEl.querySelector("#table-administration")!;


const buttonEl = <HTMLInputElement>document.getElementById("btn-administration")!;
buttonEl.addEventListener(clickEventType, exp_administration, false);


export async function exp_administration() {
    const start = 0.0;
    const end = 6.0;

    const n = 3;
    const isIvs = [true, false, false];
    const kas = [0.0, Number(paramKaImEl.value), Number(paramKaPoEl.value)];
    const fs = [1.0, 1.0, ConstVal.F_Amx];
    const amt = Number(paramAmtEl.value);
    const minsteps = [0.1, 0.02, 0.02];

    const result: SimResult[] = [];
    const second: number[][] = [];

    for (let i = 0; i < n; i++) {
        result[i] = await invoke("admin_borus", {
            start: start,
            end: end,
            isIv: isIvs[i],
            ka: kas[i],
            cl: ConstVal.CL_Amx,
            vc: ConstVal.Vd_Amx,
            k12: 0.0,
            k21: 0.0,
            amt: Number(amt),
            f: fs[i],
            div: 200.0, minstep: minsteps[i],
        });

        second[i] = await invoke("get_cmax_tmax_auc", {
            time: result[i][0],
            conc: result[i][1]
        });

    }


    // table
    const header = ["No.", "Cmax", "Tmax", "AUC"];
    const contents: string[][] = [];
    for (let i = 0; i < second.length; i++) {
        contents[i] = [
            String(i + 1),
            sprintf("%.1f", second[i][0]),
            sprintf("%.1f", second[i][1]),
            sprintf("%.1f", second[i][2])
        ];
    }
    makeTable(tableEl, header, contents);


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
        title: "Borus administration",
        xaxis: {
            title: ConstVal.xlab,
            showgrid: false,
            zeroline: true
        },
        yaxis: {
            title: ConstVal.ylab_Amx,
            range: [0, 25],
            showline: true

        },
        font: {
            size: 16
        },
        showlegend: false,
        autosize: false,
        width: ConstVal.Width,
        height: ConstVal.Height
    };
    Plotly.react('plot-administration', data, layout, {staticPlot: true});
}

