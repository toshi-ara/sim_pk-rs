# 薬物動態シミュレーション

## 概要
- 松本歯科大学の学生実習で使用する薬物動態シミュレーターです
- パラメーター値を変化させることでリアルタイムで血中濃度の推移が変化します

## このシミュレーターについて
- 2-コンパートメントモデルを想定し、常微分方程式 (ODE) を数値的に解くことで血中濃度を推定しています
- 生物学的半減期は行列の固有値をもとに算出しています
    - Rの [linpk](https://cran.r-project.org/package=linpk) パッケージを参考にしました
- [Tauri](https://tauri.app/) で作成したアプリケーションです
    - 血中濃度の推定、各種パラメーター（Cmax, Tmax, AUC, 生物学的半減期）はRust言語で算出しました
        - ODEはRustの
          [ode_solvers](https://srenevey.github.io/ode-solvers/)
          クレートを使用しました
    - GUI部分は HTML + Typescript で記述しました

## 限界
- ode_solversで値を推定する際に推定された値が小さい場合に値が不安定になるため、対数目盛で表示した場合に直線にならないことがあります
- ode_solversで値を推定する際に最終時間のデータが欠損することが多く、その影響で反復投与した際の血中濃度の推移を正しく推定することができないことがあります
