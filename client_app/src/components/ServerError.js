function ServerError() {
  return (
    <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #faf0ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '24rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#be0c0c',
          marginBottom: '0.5rem'}}>
          Server Error
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Unable to connect to the server. Please try refreshing the page or contact a system administrator if the issue persists.
        </p>
      </div>
    </div>
  );
}

export default ServerError;
