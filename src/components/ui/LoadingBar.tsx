export function LoadingBar() {
  return (
    <div
      style={{
        height: 8,
        borderRadius: 4,
        background: 'linear-gradient(90deg, #e8e4df 25%, #d8d4cf 50%, #e8e4df 75%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer 1.4s infinite linear',
      }}
      data-testid="loading-bar"
    />
  );
}
