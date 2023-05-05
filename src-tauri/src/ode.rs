use nalgebra::*;
use ode_solvers::dop853::*;

type Time = f64;
type Conc = f64;
type State = ode_solvers::Vector3<f64>;

type Params = Vec<Param>;
type States = Vec<State>;

type Times = Vec<Time>;
type Concs = Vec<Conc>;
pub type SimResult = (Times, Concs);


#[derive(Debug, Clone)]
pub struct Param {
    ka: f64,
    cl: f64,
    vc: f64,
    k12: f64,
    k21: f64,
    rate: f64
}


impl Param {
    pub fn new(ka: f64, cl: f64, vc: f64,
               k12: f64, k21: f64,
               rate: f64) -> Param {
        Param {
            ka: ka,
            cl: cl,
            vc: vc,
            k12: k12,
            k21: k21,
            rate: rate,
        }
    }

    pub fn vc(&self) -> f64 {
        self.vc
    }

    // for halflife (start)
    pub fn calc_halftime(&self) -> Vec<f64> {
        let v = self.eigenvalues();

        let n: usize = v.len();
        let mut hl: Vec<f64> = vec![0.0; n];
        for i in 0..(v.len()) {
            if v[i] >= 0.0 {
                hl[i] = std::f64::INFINITY;
            } else {
                hl[i] = - 2.0_f64.ln() / v[i];
            }
        }
        hl[0..(self.ncomp())]
            .sort_by(|a, b| a.partial_cmp(b).unwrap());
        hl
    }

    fn ncomp(&self) -> usize {
        if self.k12 == 0.0_f64 {
            1
        } else {
            2
        }
    }

    fn set_matrix(&self) -> DMatrix<f64> {
        let ke = self.cl / self.vc;
        let a: DMatrix<f64>;

        if self.ncomp() == 1 {
            // if self.ka == 0.0_f64 {
                a = dmatrix![
                    -ke;
                ];
            // } else {
            //     a = dmatrix![
            //         -ke,  self.ka;
            //         0.0, -self.ka;
            //     ];
            // }
        } else {
            // if self.ka == 0.0_f64 {
                a = dmatrix![
                    -ke - self.k12,  self.k21;
                          self.k12, -self.k21;
                ];
            // } else {
            //     a = dmatrix![
            //         -ke - self.k12,  self.k21,  self.ka;
            //               self.k12, -self.k21,      0.0;
            //                    0.0,       0.0, -self.ka;
            //     ];
            //     // ];
            // }
        };
        a
    }

    fn eigenvalues(&self) -> nalgebra::base::OVector<f64, Dyn> {
        self.set_matrix().eigenvalues().unwrap()
    }
    // for half-life (end)
}


// solver of ODE
impl ode_solvers::System<State> for Param {
    fn system(&self, _t: Time, y: &State, dy: &mut State) {
        dy[0] = - self.ka * y[0];
        dy[1] = self.ka * y[0]
                - self.cl / self.vc * y[1]
                - self.k12 * y[1]
                + self.k21 * y[2]
                + self.rate;
        dy[2] = self.k12 * y[1] - self.k21 * y[2];
    }
}

fn get_sim_conc(times: &Vec<f64>,
                params: &Vec<Param>,
                amts: &Vec<State>,
                div: f64, minstep: f64) -> SimResult {
    let mut time: Vec<f64> = Vec::new();
    let mut conc: Vec<f64> = Vec::new();
    let mut lastconc: Vec<f64> = vec![0.0; 3];

    // start simulation
    for i in 0..(times.len() - 1) {
        let start: f64 = times[i];
        let end: f64 = times[i + 1];

        if start == end {
            continue;
        }

        let mut step = (end - start) / div;
        if step < minstep {
            step = minstep;
        }

        // set initial amount in each compartment
        let amt = State::new(
            lastconc[0] + amts[i][0],
            lastconc[1] + amts[i][1],
            lastconc[2] + amts[i][2],
        );

        // solve ODE
        let mut minstepper = Dop853::new(
            params[i].clone(),
            start, end, step,
            amt,
            1e-4, 1e-4);
        let res = minstepper.integrate();

        match res {
            Ok(_) => {
                // obtain concentration at last time
                let ylast = minstepper.y_out().last().unwrap();
                lastconc[0] = ylast[0];
                lastconc[1] = ylast[1];
                lastconc[2] = ylast[2];

                // calculate concentration in central compartment
                let mut conc_tmp: Vec<f64> = minstepper.y_out()
                    .iter()
                    .map(|x| x[1] / params[i].vc())
                    .collect();

                // append time/concentration to each vector
                time.append(&mut minstepper.x_out().clone());
                conc.append(&mut conc_tmp);
            }
            Err(e) => println!("An error occured: {}", e)
        }
    }

    // complement last time/concentration
    time.push(*(times.last().unwrap()));
    let n = conc.len();
    conc.push(2.0 * conc[n - 1] - conc[n - 2]);

    // return
    (time, conc)
}


// top level functions
pub fn admin_borus(start: f64, end: f64,
                   is_iv: bool,
                   ka: f64, cl: f64, vc: f64, k12: f64, k21: f64,
                   amt: f64, f: f64,
                   div: f64, minstep: f64) -> SimResult {
    let times = vec![start, end];
    let amts = set_state_borus(is_iv, amt, f);
    let params = set_params_borus(ka, cl, vc, k12, k21);
    let result = get_sim_conc(&times, &params, &amts, div, minstep);
    result
}

pub fn admin_infusion(start: f64, end: f64,
                      cl: f64, vc: f64, k12: f64, k21: f64,
                      amt: f64, duration: f64,
                      div: f64, minstep: f64) -> SimResult {
    let times = vec![start, duration, end];
    let params = set_params_infusion(cl, vc, k12, k21, amt, duration);
    let amts = set_state_infusion();
    let result = get_sim_conc(&times, &params, &amts, div, minstep);
    result
}

pub fn admin_repeat(start: f64, end: f64,
                    is_iv: bool,
                    ka: f64, cl: f64, vc: f64, k12: f64, k21: f64,
                    amt: f64, f: f64,
                    ii: f64, addl: usize,
                    div: f64, minstep: f64) -> SimResult {
    let times = set_time_repeat(start, end, ii, addl);
    let params = set_params_repeat(ka, cl, vc, k12, k21, addl);
    let amts = set_state_repeat(is_iv, amt, f, addl);
    let result = get_sim_conc(&times, &params, &amts, div, minstep);
    result
}

pub fn admin_loading(start: f64, end: f64,
                     is_iv: bool,
                     ka: f64, cl: f64, vc: f64, k12: f64, k21: f64,
                     amt1: f64, amt2: f64, f: f64,
                     ii: f64, addl: usize,
                     div: f64, minstep: f64) -> SimResult {
    let times = set_time_repeat(start, end, ii, addl);
    let params = set_params_repeat(ka, cl, vc, k12, k21, addl);
    let amts = set_state_loading(is_iv, amt1, amt2, f, addl);
    let result = get_sim_conc(&times, &params, &amts, div, minstep);
    result
}


// set parameters
// for borus
fn set_state_borus(is_iv: bool, amt: f64, f: f64) -> States {
    if is_iv {
        vec![
            State::new(0.0, amt, 0.0),
            State::new(0.0, 0.0, 0.0),
        ]
    } else {
        vec![
            State::new(amt * f, 0.0, 0.0),
            State::new(0.0, 0.0, 0.0),
        ]
    }
}

fn set_params_borus(ka: f64, cl: f64, vc: f64,
                    k12: f64, k21: f64) -> Params {
    vec![Param::new(ka, cl, vc, k12, k21, 0.0); 2]
}


// for infusion
fn set_state_infusion() -> States {
    vec![State::new(0.0, 0.0, 0.0); 3]
}

fn set_params_infusion(cl: f64, vc: f64, k12: f64, k21: f64,
                       amt: f64, duration: f64) -> Params {
    vec![
        Param::new(0.0, cl, vc, k12, k21, amt / duration),
        Param::new(0.0, cl, vc, k12, k21, 0.0),
        Param::new(0.0, cl, vc, k12, k21, 0.0)
    ]
}

// for repeated administration
fn set_time_repeat(start: f64, end: f64,
                   ii: f64, addl: usize) -> Times {
    let mut last_time: f64 = start + ii * (addl + 1) as f64;
    if last_time < end {
        last_time = end;
    }

    let mut time_vec = vec![0.0; addl + 1];
    for i in 0..(addl + 1) {
        time_vec[i] = start + ii * i as f64;
    }
    time_vec.push(last_time);
    time_vec
}

fn set_state_repeat(is_iv: bool, amt: f64, f: f64,
                    addl: usize) -> States {
    let state: State = if is_iv {
        State::new(0.0, amt, 0.0)
    } else {
        State::new(amt * f, 0.0, 0.0)
    };

    let mut states: States = vec![state; addl + 1];
    states.push(State::new(0.0, 0.0, 0.0));
    states
}

fn set_params_repeat(ka: f64, cl: f64, vc: f64, k12: f64, k21: f64,
                     addl: usize) -> Params {
    vec![Param::new(ka, cl, vc, k12, k21, 0.0); addl + 2]
}

fn set_state_loading(is_iv: bool, amt1: f64, amt2: f64, f: f64,
                     addl: usize) -> States {
    let state1: State;
    let state2: State;

    if is_iv {
        state1 = State::new(0.0, amt1, 0.0);
        state2 = State::new(0.0, amt2, 0.0);
    } else {
        state1 = State::new(amt1 * f, 0.0, 0.0);
        state2 = State::new(amt2 * f, 0.0, 0.0);
    };

    let mut states: States = vec![state1];
    states.append(&mut vec![state2; addl]);
    states.push(State::new(0.0, 0.0, 0.0));
    states
}


// calculate Cmax / Tmax / AUC
pub fn get_cmax_tmax_auc(time: &Times, conc: &Concs) -> (f64, f64, f64) {
    // Cmax / Tmax
    let mut max: f64 = conc[0];
    let mut max_index: usize = 0;
    for (index, &x) in conc.iter().enumerate() {
        if x > max {
            max = x;
            max_index = index;
        }
    }

    // AUC
    let mut auc: f64 = 0.0;
    for i in 0..(&time.len() - 1) {
        auc += (&conc[i] + &conc[i + 1]) * (&time[i + 1] - &time[i]);
    }

    (conc[max_index], time[max_index], auc/ 2.0)
}

