export default function Landing({ user }) {
  return (
    <div className="page">
      <nav className="wrap nav">
        <span className="brand">💰 Rupee Ledger</span>
        <div className="nav-links">
          {user ? (
            <a className="btn primary" href="#/dashboard">Open dashboard</a>
          ) : (
            <>
              <a className="btn" href="#/login">Log in</a>
              <a className="btn primary" href="#/register">Sign up</a>
            </>
          )}
        </div>
      </nav>

      <header className="wrap hero">
        <h1>Know where every rupee goes.</h1>
        <p>Log what you spend in a few taps, sort it into categories, and see your total at a glance. Each person gets their own private ledger.</p>
        <div className="hero-actions">
          <a className="btn primary big" href="#/dashboard">Open dashboard</a>
          {!user && <a className="btn big" href="#/register">Create an account</a>}
        </div>
      </header>

      <section className="wrap features">
        <article className="card tilt-l"><span>🧾</span><h3>Add in seconds</h3><p>Title, amount, category and date. Fix or delete a mistake any time.</p></article>
        <article className="card tilt-r"><span>📊</span><h3>See the split</h3><p>A running total plus a bar showing which category takes the most.</p></article>
        <article className="card tilt-l"><span>🔒</span><h3>Your own account</h3><p>Sign up once and your expenses stay with you, saved in the database.</p></article>
      </section>
    </div>
  );
}
