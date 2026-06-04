import styles from "./NdviLegend.module.scss";

export const NdviLegend = () => {
  const items = [
    { color: "#888888", label: "Agua / urbano", range: "NDVI < 0" },
    {
      color: "#e63333",
      label: "Suelo desnudo / estrés severo",
      range: "0 – 0.2",
    },
    { color: "#e6b31a", label: "Vegetación escasa", range: "0.2 – 0.4" },
    { color: "#99e61a", label: "Vegetación moderada", range: "0.4 – 0.6" },
    { color: "#1a991a", label: "Vegetación sana", range: "> 0.6" },
  ];

  return (
    <div className={styles.legend}>
      <p className={styles.legend__title}>Leyenda NDVI</p>
      <div className={styles.legend__items}>
        {items.map((item) => (
          <div key={item.label} className={styles.legend__item}>
            <span
              className={styles.legend__color}
              style={{ background: item.color }}
            />
            <span className={styles.legend__range}>{item.range}</span>
            <span className={styles.legend__label}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
