# Adaptive Signal Processing Lab: Algorithm Learning Guide

This document explains the algorithms used in the lab experiments, why they are used, and what to observe in simulation outputs.

## Where these algorithms are used

- `exp3a` uses:
  - **AR Process (with LMS estimation)** via `runLMS_AR()`
  - **MVDR Beamformer** via `runMVDR()`
- `exp3b` uses:
  - **LMS Equalization**
  - **LMS Prediction**
  - **RLS Equalization**
  - **RLS Prediction**

Core implementations are in `Intern/octave-client/src/utils/algorithms.js`.

---

## 1) LMS (Least Mean Squares)

### What it is
LMS is an adaptive filtering algorithm that updates filter coefficients to minimize mean square error (MSE) between desired output and filter output.

Typical update:

`w(n+1) = w(n) + mu * e(n) * x(n)`

- `w`: filter weights
- `mu`: step size (learning rate)
- `e(n)`: error at sample `n`
- `x(n)`: input vector

### Why we use it in this lab
- It is simple, intuitive, and widely taught first in adaptive filtering.
- It shows the basic trade-off:
  - Larger `mu` -> faster convergence but more instability/noise.
  - Smaller `mu` -> slower but smoother convergence.

### In your experiments
- **Exp3a (AR Process):** LMS estimates AR model coefficients from generated data.
- **Exp3b (Equalization/Prediction):**
  - Equalization: compensates channel distortion.
  - Prediction: predicts next sample of a correlated process.

### What to observe
- MSE should generally decrease over iterations.
- Weights should approach stable values if parameters are well chosen.

---

## 2) RLS (Recursive Least Squares)

### What it is
RLS is an adaptive algorithm that usually converges faster than LMS by using an online least-squares approach with a matrix update.

Key parameters:
- `lambda` (forgetting factor): how much old data is remembered.
- `delta`: initialization for inverse correlation matrix.

### Why we use it in this lab
- Demonstrates a higher-performance alternative to LMS.
- Useful when fast convergence is important.
- Lets students compare complexity vs performance.

### In your experiments
- Used in **Exp3b** for:
  - RLS Equalization
  - RLS Prediction

### What to observe
- Faster convergence than LMS in many settings.
- More sensitive to parameter selection and numerics.
- Higher computational cost than LMS.

---

## 3) MVDR Beamformer (Minimum Variance Distortionless Response)

### What it is
MVDR is an adaptive beamforming method for antenna arrays. It minimizes output power while preserving gain in the desired signal direction.

### Why we use it in this lab
- Introduces adaptive spatial filtering (array processing), not just temporal filtering.
- Shows how to:
  - enhance desired direction (`theta_s`)
  - suppress interference direction (`theta_i`)

### In your experiments
- Used in **Exp3a** with controls for:
  - Number of antennas
  - Desired/interference DOA angles
  - SNR/INR and snapshots

### What to observe
- A main lobe near desired direction.
- A deep notch near interference direction.
- Pattern quality changes with array size and noise conditions.

---

## 4) AR Process (Autoregressive Process)

### What it is
An AR process models current sample from previous samples plus noise, for example:

`u[n] = a1*u[n-1] + a2*u[n-2] + v[n]`

### Why we use it in this lab
- Gives a controlled synthetic signal with known temporal structure.
- Ideal for testing predictor/equalizer behavior.
- Helps visualize coefficient learning and prediction error.

### In your experiments
- AR signal is generated and LMS is used to estimate/track parameters.

---

## Equalization vs Prediction (why both)

- **Equalization**: recover original data after channel distortion/noise.
- **Prediction**: estimate future/current samples from past samples.

Using both tasks helps understand that the same adaptive algorithms can solve different signal-processing problems by changing the desired signal definition.

---

## Why these algorithms together in one lab

This set creates a good learning progression:

1. Start with **LMS** for fundamentals.
2. Compare with **RLS** for faster convergence and higher complexity.
3. Extend to **MVDR** for spatial signal processing.
4. Use **AR models** to ground everything in a known stochastic process.

This gives practical intuition about convergence, stability, complexity, and real-world design trade-offs.

---

## Practical parameter tips for students

- If LMS diverges or oscillates, reduce `mu`.
- For RLS, start with `lambda` close to `1` (for example `0.99`) and moderate `delta`.
- For prediction quality, ensure process has enough correlation and model order is reasonable.
- For MVDR, verify that desired and interference DOAs are sufficiently separated.

---

## Recent reproducibility fix (important)

The project now uses deterministic seeding for random signal generation in adaptive algorithm runs.  
This means:

- same parameter configuration -> same generated signal/results
- easier debugging
- fair LMS vs RLS comparison

Implemented in:
- `buildDeterministicSeed(...)` in `Intern/octave-client/src/utils/algorithms.js`
- experiment right panels where run configurations are built before calling algorithms.
