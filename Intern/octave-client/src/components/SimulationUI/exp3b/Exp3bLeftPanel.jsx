import { useContext } from "react";
import styles from "../leftPanel/leftPanel.module.css";
import { EcgUnfilter } from "../graph/EcgUnfilter.jsx";
import { Exp3bGraph } from "../graph/Exp3bGraph.jsx";
import { SimulationContext } from "../../../context/SimulationContext";

export const Exp3bLeftPanel = () => {
  const { generateECG } = useContext(SimulationContext);
  return (
    <div className={styles.leftPanelContainer}>
      <div className={styles.container}>
        <div>{generateECG && <EcgUnfilter />}</div>
        <div>
          <Exp3bGraph />
        </div>
      </div>
    </div>
  );
};
