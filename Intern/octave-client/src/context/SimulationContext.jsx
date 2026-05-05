import { createContext, useEffect, useRef, useState } from "react";
import Papa from "papaparse";

export const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const [showInstruction, setShowInstruction] = useState(false);
  const buttonRef = useRef(null);

  const [csvFilePath, setCsvFilePath] = useState("/ecg100.csv");
  const prevPathRef = useRef(csvFilePath);

  const [time, setTime] = useState(5);

  const [generateECG, setGenerateECG] = useState(false);
  const [filteredECG, setFilteredECG] = useState(false);
  const [applypsdTrigger, setApplypsdTrigger] = useState(false); // kept for UI compatibility

  const [config, setConfig] = useState({
    order: 5,
    characteristic: "IIR",
    filterType: "bandpass",
    windowMode: "windowSync",

    preGain: false,
    Fs: 500,
    // IIR-bandpass/bandstop/highpass/lowpass
    // FIR-windowSync-highpass/lowpass
    Fc: 10,
    // fir-windowSync-bandpass/bandstop
    F1: null,
    F2: null,
    // fir-KaiserBessel-bandpass/bandstop
    Fa: null,
    Fb: null,
    Att: 100,
  });

  // raw parsed samples and inferred original Fs
  const [rawSamples, setRawSamples] = useState([]);
  const [originalFs, setOriginalFs] = useState(500);
  const [filteredSamples, setFilteredSamples] = useState([]);

  const [colors, setColors] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState(["ECG_I"]);

  // Algorithm output
  const [algoResults, setAlgoResults] = useState(null);
  const [algorithmType, setAlgorithmType] = useState("AR Process");

  /** Exp 3b: LMS / RLS task selection (unused by Exp 3a UI) */
  const [selectedAlgo, setSelectedAlgo] = useState("LMS");
  const [selectedMode, setSelectedMode] = useState("Equalization");

  // parse CSV once on path change and cache
  useEffect(() => {
    Papa.parse(csvFilePath, {
      download: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data;
        if (!rows.length) return;
        const headers = (rows[0] || []).map((h) =>
          typeof h === "string" ? h.trim() : h
        );

        const timeIdx =
          headers.indexOf("time_sec") !== -1
            ? headers.indexOf("time_sec")
            : headers.indexOf("Time");
        if (timeIdx === -1) return;

        const colorsName = [
          "#ff4d4d",
          "#4da6ff",
          "#66ff66",
          "#ffcc00",
          "#cc66ff",
          "#00cccc",
          "#ff9966",
          "#9999ff",
          "#ff6666",
          "#66ccff",
          "#99ff99",
          "#ffd966",
          "#d699ff",
          "#00ffcc",
          "#ffb366",
          "#b3b3ff",
          "#ff8080",
          "#80bfff",
          "#80ffbf",
          "#ff80ff",
          "#a6a6ff",
          "#ffcc99",
          "#66ffcc",
          "#cccccc",
        ];
        setColors(colorsName);

        const hasECG = headers.includes("ECG_I");
        const channelNames = hasECG ? ["ECG_I"] : [];
        const channelIndices = channelNames.map((ch) => headers.indexOf(ch));

        // fallback to first numeric column (excluding time)
        if (!channelNames.length) {
          for (let i = 0; i < headers.length; i++) {
            if (i === timeIdx) continue;
            const v = parseFloat(rows?.[1]?.[i]);
            if (!Number.isNaN(v)) {
              channelNames.push(String(headers[i]));
              channelIndices.push(i);
              break;
            }
          }
        }

        if (!channelNames.length) return;
        setSelectedChannels(channelNames);

        const t0 = parseFloat(rows?.[1]?.[timeIdx]) || 0;

        const parsed = rows.slice(1).map((row) => {
          const point = { x: (parseFloat(row?.[timeIdx]) || 0) - t0 };
          channelNames.forEach((ch, i) => {
            const idx = channelIndices[i];
            point[ch] = parseFloat(row?.[idx]) || 0;
          });
          return point;
        });

        setRawSamples(parsed);
        const dt = parsed.length > 1 ? parsed[1].x - parsed[0].x : 0.002;
        const fsOriginal = Number(dt > 0 ? 1 / dt : 500).toFixed(2);
        setOriginalFs(fsOriginal);
      },
      error: (err) => console.error("CSV parse error", err),
    });
  }, [csvFilePath]);

  return (
    <SimulationContext.Provider
      value={{
        showInstruction,
        setShowInstruction,
        buttonRef,
        generateECG,
        setGenerateECG,
        filteredECG,
        setFilteredECG,
        config,
        setConfig,
        time,
        setTime,
        csvFilePath,
        prevPathRef,
        setCsvFilePath,
        rawSamples,
        originalFs,
        colors,
        setColors,
        selectedChannels,
        setSelectedChannels,
        applypsdTrigger,
        setApplypsdTrigger,
        filteredSamples,
        setFilteredSamples,
        algoResults,
        setAlgoResults,
        algorithmType,
        setAlgorithmType,
        selectedAlgo,
        setSelectedAlgo,
        selectedMode,
        setSelectedMode,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
