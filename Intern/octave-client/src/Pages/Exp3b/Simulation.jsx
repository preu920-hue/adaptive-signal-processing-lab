import React, { useContext } from "react";
import Swal from "sweetalert2";
import { SimulationProvider } from "../../context/SimulationContext";
import { SimulationContext } from "../../context/SimulationContext";
import { Exp3bLeftPanel } from "../../components/SimulationUI/exp3b/Exp3bLeftPanel.jsx";
import { Exp3bRightPanel } from "../../components/SimulationUI/exp3b/Exp3bRightPanel.jsx";

const SimulationContent = () => {
  const { setShowInstruction } = useContext(SimulationContext);

  const openInstructions = async () => {
    setShowInstruction(true);
    await Swal.fire({
      title: "Simulation Instructions",
      html: `
        <div style="text-align:left; line-height:1.5">
          <ol style="padding-left:18px; margin:0">
            <li>Select an ECG dataset.</li>
            <li>Set the duration (seconds).</li>
            <li>Click <b>Generate ECG Signal</b>.</li>
            <li>Choose <b>LMS</b> or <b>RLS</b>, and <b>Equalization</b> or <b>Prediction</b>.</li>
            <li>Adjust parameters and click <b>Apply Algorithm</b>.</li>
          </ol>
        </div>
      `,
      confirmButtonText: "Got it",
      width: 520,
    });
    setShowInstruction(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative flex flex-col md:flex-row w-full max-w-7xl justify-between mt-5 gap-6 bg-[#fcfcf9] p-4 pt-14 rounded-xl shadow">
        <button
          type="button"
          className="absolute top-3 right-3 z-10 px-4 py-2 rounded-lg bg-blue-button hover:bg-blue-hover"
          onClick={openInstructions}
        >
          Instructions
        </button>
        <div className="w-full md:w-[420px] md:flex-none">
          <Exp3bRightPanel />
        </div>
        <div className="w-full flex-1 min-w-0">
          <Exp3bLeftPanel />
        </div>
      </div>
    </div>
  );
};

const Simulation = () => (
  <SimulationProvider>
    <SimulationContent />
  </SimulationProvider>
);

export default Simulation;
