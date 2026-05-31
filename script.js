// Obfuscation Engine
class LuaObfuscator {
    constructor() {
        this.level = 'medium';
        this.settings = {
            renameVars: true,
            renameFuncs: true,
            stringEncode: true,
            numberEncode: true,
            removeComments: true,
            removeWhitespace: true,
            addDeadCode: true,
            controlFlow: true,
            varLength: 4,
            antiDecompile: false,
            watermark: false
        };
    }
    
    obfuscate(code) {
        let result = code;
        
        // Remove comments
        if (this.settings.removeComments) {
            result = result.replace(/--.*$/gm, '');
            result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        }
        
        // Token generation
        const varNames = this.generateVarNames(100);
        const funcNames = this.generateVarNames(50);
        
        // Find and rename variables
        if (this.settings.renameVars) {
            const varPattern = /\b(local\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
            let varCounter = 0;
            const varMap = new Map();
            
            result = result.replace(varPattern, (match, local, varName) => {
                if (this.isReservedWord(varName)) return match;
                if (varMap.has(varName)) {
                    return (local || '') + varMap.get(varName);
                }
                const newName = varNames[varCounter++ % varNames.length];
                varMap.set(varName, newName);
                return (local || '') + newName;
            });
        }
        
        // Encode strings
        if (this.settings.stringEncode) {
            result = result.replace(/"([^"]*)"/g, (match, str) => {
                return this.encodeString(str);
            });
            result = result.replace(/'([^']*)'/g, (match, str) => {
                return this.encodeString(str);
            });
        }
        
        // Encode numbers
        if (this.settings.numberEncode) {
            result = result.replace(/\b(\d+)\b/g, (match, num) => {
                if (num.length > 3) return match;
                return this.encodeNumber(parseInt(num));
            });
        }
        
        // Add dead code
        if (this.settings.addDeadCode && this.level !== 'light') {
            result = this.insertDeadCode(result);
        }
        
        // Control flow obfuscation
        if (this.settings.controlFlow && this.level === 'extreme') {
            result = this.obfuscateControlFlow(result);
        }
        
        // Anti-decompile header
        if (this.settings.antiDecompile) {
            result = this.addAntiDecompile(result);
        }
        
        // Watermark
        if (this.settings.watermark) {
            result = `-- Obfuscated by BLACKGPT Lua Obfuscator v4.2.0\n-- Protected script\n${result}`;
        }
        
        // Remove whitespace (optional)
        if (this.settings.removeWhitespace && this.level !== 'light') {
            result = result.replace(/\s+/g, ' ');
            result = result.replace(/;\s*;/g, ';');
        }
        
        return result;
    }
    
    generateVarNames(count) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
        const names = [];
        const length = this.settings.varLength;
        
        for (let i = 0; i < count; i++) {
            let name = '';
            for (let j = 0; j < length; j++) {
                name += chars[Math.floor(Math.random() * chars.length)];
            }
            names.push(name);
        }
        return names;
    }
    
    encodeString(str) {
        const methods = ['char', 'hex', 'base64'];
        const method = methods[Math.floor(Math.random() * methods.length)];
        
        switch(method) {
            case 'char':
                const chars = [];
                for (let i = 0; i < str.length; i++) {
                    chars.push(str.charCodeAt(i));
                }
                return `string.char(${chars.join(',')})`;
            case 'hex':
                let hex = '';
                for (let i = 0; i < str.length; i++) {
                    hex += str.charCodeAt(i).toString(16);
                }
                return `(function() local t={${hex.split('').join(',')}} local r='' for i=1,#t,2 do r=r..string.char(tonumber(table.concat({t[i],t[i+1]}),16)) end return r end)()`;
            default:
                const b64 = btoa(str);
                return `(function() return (function(s) return (s:gsub('..', function(c) return string.char(tonumber(c, 16)) end)) end)('${this.toHex(b64)}') end)()`;
        }
    }
    
    encodeNumber(num) {
        const r1 = Math.floor(Math.random() * 100) + 1;
        const r2 = Math.floor(Math.random() * 100) + 1;
        return `(${r1} + ${num - r1})`;
    }
    
    insertDeadCode(code) {
        const deadCode = [
            'if false then local _ = 1 end',
            'if nil then local _ = 2 end',
            'do local _ = 3 end'
        ];
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i += 10) {
            lines.splice(i, 0, deadCode[Math.floor(Math.random() * deadCode.length)]);
        }
        return lines.join('\n');
    }
    
    obfuscateControlFlow(code) {
        return `(function()\n${code}\nend)()`;
    }
    
    addAntiDecompile(code) {
        return `--[[\nAnti-Decompile Protection Active\n--]]\n${code}\n--[[\nEnd of Protected Script\n--]]`;
    }
    
    isReservedWord(word) {
        const reserved = ['if', 'then', 'else', 'elseif', 'end', 'for', 'while', 'do', 'return', 'local', 'function', 'nil', 'true', 'false', 'and', 'or', 'not', 'break', 'goto', 'in', 'repeat', 'until'];
        return reserved.includes(word);
    }
    
    toHex(str) {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16);
        }
        return hex;
    }
    
    calculateStats(code) {
        const lines = code.split('\n').length;
        const chars = code.length;
        return { lines, chars };
    }
}

// UI Controller
class UIController {
    constructor() {
        this.obfuscator = new LuaObfuscator();
        this.initElements();
        this.initEvents();
        this.initTabs();
    }
    
    initElements() {
        this.inputArea = document.getElementById('inputScript');
        this.outputArea = document.getElementById('outputScript');
        this.obfuscateBtn = document.getElementById('obfuscateBtn');
        this.copyBtn = document.getElementById('copyOutput');
        this.downloadBtn = document.getElementById('downloadOutput');
        this.clearInputBtn = document.getElementById('clearInput');
        this.clearOutputBtn = document.getElementById('clearOutput');
        this.loadExampleBtn = document.getElementById('loadExample');
        this.uploadBtn = document.getElementById('uploadFile');
        this.inputStats = document.getElementById('inputStats');
        this.outputStats = document.getElementById('outputStats');
        this.compressionRate = document.getElementById('compressionRate');
        
        // Level buttons
        this.levelBtns = document.querySelectorAll('.level-btn');
        
        // Checkboxes
        this.renameVars = document.getElementById('renameVars');
        this.renameFuncs = document.getElementById('renameFuncs');
        this.stringEncode = document.getElementById('stringEncode');
        this.numberEncode = document.getElementById('numberEncode');
        this.removeComments = document.getElementById('removeComments');
        this.removeWhitespace = document.getElementById('removeWhitespace');
        this.addDeadCode = document.getElementById('addDeadCode');
        this.controlFlow = document.getElementById('controlFlow');
        
        // Settings
        this.varLength = document.getElementById('varLength');
        this.antiDecompile = document.getElementById('antiDecompile');
        this.watermark = document.getElementById('watermark');
        this.fontSize = document.getElementById('fontSize');
        this.themeSelect = document.getElementById('themeSelect');
        this.editorTheme = document.getElementById('editorTheme');
    }
    
    initEvents() {
        // Obfuscate
        this.obfuscateBtn.addEventListener('click', () => this.obfuscate());
        
        // Copy output
        this.copyBtn.addEventListener('click', () => {
            this.outputArea.select();
            document.execCommand('copy');
            this.showNotification('Copied to clipboard!');
        });
        
        // Download output
        this.downloadBtn.addEventListener('click', () => {
            const blob = new Blob([this.outputArea.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `obfuscated_${Date.now()}.lua`;
            a.click();
            URL.revokeObjectURL(url);
        });
        
        // Clear input
        this.clearInputBtn.addEventListener('click', () => {
            this.inputArea.value = '';
            this.updateStats();
        });
        
        // Clear output
        this.clearOutputBtn.addEventListener('click', () => {
            this.outputArea.value = '';
            this.updateOutputStats();
        });
        
        // Load example
        this.loadExampleBtn.addEventListener('click', () => {
            this.inputArea.value = `-- Example Roblox Script
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local Mouse = LocalPlayer:GetMouse()

print("Script loaded successfully!")

Mouse.Button1Down:Connect(function()
    print("Mouse clicked!")
end)`;
            this.updateStats();
        });
        
        // Upload file
        this.uploadBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.lua,.txt';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.inputArea.value = e.target.result;
                    this.updateStats();
                };
                reader.readAsText(file);
            };
            input.click();
        });
        
        // Level buttons
        this.levelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.levelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.obfuscator.level = btn.dataset.level;
            });
        });
        
        // Checkbox sync
        const checkboxes = [this.renameVars, this.renameFuncs, this.stringEncode, 
                           this.numberEncode, this.removeComments, this.removeWhitespace, 
                           this.addDeadCode, this.controlFlow];
        
        checkboxes.forEach(cb => {
            if (cb) cb.addEventListener('change', () => this.syncSettings());
        });
        
        // Settings
        if (this.varLength) {
            this.varLength.addEventListener('input', (e) => {
                document.getElementById('varLengthValue').textContent = e.target.value + ' chars';
                this.syncSettings();
            });
        }
        
        if (this.antiDecompile) this.antiDecompile.addEventListener('change', () => this.syncSettings());
        if (this.watermark) this.watermark.addEventListener('change', () => this.syncSettings());
        
        // Font size
        if (this.fontSize) {
            this.fontSize.addEventListener('input', (e) => {
                const size = e.target.value;
                document.getElementById('fontSizeValue').textContent = size + 'px';
                document.querySelectorAll('textarea').forEach(ta => {
                    ta.style.fontSize = size + 'px';
                });
            });
        }
        
        // Theme
        if (this.themeSelect) {
            this.themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
        
        // Input stats update
        this.inputArea.addEventListener('input', () => this.updateStats());
        
        // Presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
        });
        
        this.updateStats();
    }
    
    syncSettings() {
        this.obfuscator.settings.renameVars = this.renameVars?.checked || false;
        this.obfuscator.settings.renameFuncs = this.renameFuncs?.checked || false;
        this.obfuscator.settings.stringEncode = this.stringEncode?.checked || false;
        this.obfuscator.settings.numberEncode = this.numberEncode?.checked || false;
        this.obfuscator.settings.removeComments = this.removeComments?.checked || false;
        this.obfuscator.settings.removeWhitespace = this.removeWhitespace?.checked || false;
        this.obfuscator.settings.addDeadCode = this.addDeadCode?.checked || false;
        this.obfuscator.settings.controlFlow = this.controlFlow?.checked || false;
        this.obfuscator.settings.varLength = parseInt(this.varLength?.value) || 4;
        this.obfuscator.settings.antiDecompile = this.antiDecompile?.checked || false;
        this.obfuscator.settings.watermark = this.watermark?.checked || false;
    }
    
    applyPreset(preset) {
        switch(preset) {
            case 'speed':
                this.renameVars.checked = true;
                this.stringEncode.checked = false;
                this.controlFlow.checked = false;
                this.addDeadCode.checked = false;
                this.removeWhitespace.checked = true;
                break;
            case 'security':
                this.renameVars.checked = true;
                this.stringEncode.checked = true;
                this.controlFlow.checked = true;
                this.addDeadCode.checked = true;
                this.antiDecompile.checked = true;
                break;
            case 'size':
                this.renameVars.checked = true;
                this.removeWhitespace.checked = true;
                this.stringEncode.checked = false;
                this.addDeadCode.checked = false;
                break;
            case 'balance':
                this.renameVars.checked = true;
                this.stringEncode.checked = true;
                this.controlFlow.checked = false;
                this.addDeadCode.checked = true;
                break;
        }
        this.syncSettings();
        this.showNotification(`Preset "${preset}" applied!`);
    }
    
    applyTheme(theme) {
        const root = document.documentElement;
        switch(theme) {
            case 'darker':
                root.style.setProperty('--bg-primary', '#050508');
                root.style.setProperty('--bg-secondary', '#0a0a0f');
                root.style.setProperty('--bg-tertiary', '#0f0f15');
                break;
            case 'midnight':
                root.style.setProperty('--bg-primary', '#0a0e27');
                root.style.setProperty('--bg-secondary', '#0f1433');
                root.style.setProperty('--bg-tertiary', '#141a40');
                root.style.setProperty('--accent', '#3b82f6');
                break;
            case 'matrix':
                root.style.setProperty('--bg-primary', '#001100');
                root.style.setProperty('--bg-secondary', '#002200');
                root.style.setProperty('--bg-tertiary', '#003300');
                root.style.setProperty('--accent', '#00ff00');
                root.style.setProperty('--text-primary', '#00ff00');
                break;
            default:
                root.style.setProperty('--bg-primary', '#0a0a0f');
                root.style.setProperty('--bg-secondary', '#0f0f15');
                root.style.setProperty('--bg-tertiary', '#15151f');
                root.style.setProperty('--accent', '#8b5cf6');
        }
    }
    
    obfuscate() {
        const input = this.inputArea.value;
        if (!input.trim()) {
            this.showNotification('Please enter some code first!', 'error');
            return;
        }
        
        this.syncSettings();
        
        try {
            const output = this.obfuscator.obfuscate(input);
            this.outputArea.value = output;
            this.updateOutputStats(input, output);
            this.showNotification('Obfuscation completed!', 'success');
        } catch(e) {
            console.error(e);
            this.showNotification('Obfuscation failed!', 'error');
        }
    }
    
    updateStats() {
        const stats = this.obfuscator.calculateStats(this.inputArea.value);
        this.inputStats.textContent = `${stats.lines} lines | ${stats.chars} characters`;
    }
    
    updateOutputStats(input, output) {
        const stats = this.obfuscator.calculateStats(this.outputArea.value);
        this.outputStats.textContent = `${stats.lines} lines | ${stats.chars} characters`;
        
        if (input && output) {
            const ratio = ((1 - output.length / input.length) * 100).toFixed(1);
            this.compressionRate.textContent = `Compression: ${ratio}%`;
        }
    }
    
    showNotification(msg, type = 'info') {
        // Create notification
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = msg;
        notif.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: var(--bg-secondary);
            border: 1px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--accent)'};
            border-radius: 10px;
            color: var(--text-primary);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.remove();
        }, 3000);
    }
    
    initTabs() {
        const menuItems = document.querySelectorAll('.menu-item');
        const tabs = {
            obfuscator: document.getElementById('obfuscatorTab'),
            settings: document.getElementById('settingsTab'),
            about: document.getElementById('aboutTab')
        };
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                
                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                Object.values(tabs).forEach(t => t.classList.remove('active'));
                tabs[tab].classList.add('active');
            });
        });
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new UIController();
});
