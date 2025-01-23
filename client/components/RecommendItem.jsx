export default function RecommendItem({ icon, text, onClick }) {
  return (
    <div className={styles.recommendItem} onClick={onClick}>
      <div className={styles.iconWrapper}>
        <img src={icon} alt="" className={styles.icon} />
      </div>
      <div className={styles.text}>{text}</div>
    </div>
  );
} 