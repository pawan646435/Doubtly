// backend/server.js
// Local development server entry point

const app = require('./app');
const PORT = process.env.PORT || 5000;

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║                                      ║');
  console.log(`  ║   ✦  Doubtly API — Port ${PORT}        ║`);
  console.log('  ║   ✦  Ready to solve doubts!          ║');
  console.log('  ║                                      ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
