:root { --bg: #f0f2f5; --primary: #1a73e8; --white: #ffffff; --text: #202124; }
* { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; }
body { background: var(--bg); color: var(--text); }
.app-container { max-width: 480px; margin: 0 auto; min-height: 100vh; background: white; }
.minimal-header { background: var(--primary); color: white; padding: 30px 20px; border-bottom-left-radius: 25px; border-bottom-right-radius: 25px; text-align: center; }
.header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 18px; }
.balance-card h1 { font-size: 32px; margin-top: 5px; }
.main-content { padding: 20px; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
.stat-box { background: #f8f9fa; padding: 15px; border-radius: 15px; text-align: center; border: 1px solid #e8eaed; }
.task-item { background: white; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; border: 1px solid #e8eaed; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.task-icon { width: 40px; height: 40px; background: #e8f0fe; color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.sidebar { position: fixed; top: 0; left: -280px; width: 260px; height: 100%; background: white; z-index: 1001; transition: 0.3s; padding: 20px; box-shadow: 2px 0 10px rgba(0,0,0,0.1); }
.sidebar.active { left: 0; }
.menu-list { list-style: none; margin-top: 20px; }
.menu-list a { text-decoration: none; color: #3c4043; padding: 12px; display: block; border-radius: 8px; }
#loading-screen { position: fixed; inset: 0; background: white; z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.auth-wrapper { display: flex; justify-content: center; align-items: center; height: 100vh; padding: 20px; }
.auth-card { background: white; padding: 30px; border-radius: 20px; width: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; }
.input-field { background: #f1f3f4; padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; align-items: center; }
.input-field input { border: none; background: transparent; outline: none; width: 100%; margin-left: 10px; }
.main-btn-min { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 2000; }
.modal-box { background: white; padding: 25px; border-radius: 20px; width: 90%; max-width: 320px; text-align: center; }
.action-footer { display: flex; gap: 10px; margin-top: 20px; }
.btn-bonus, .btn-withdraw { flex: 1; padding: 15px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; }
.btn-bonus { background: #fff4e5; color: #b06000; }
.btn-withdraw { background: #e6f4ea; color: #1e8e3e; }
