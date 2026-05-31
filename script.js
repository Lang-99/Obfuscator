// Nautica Obfuscator Core
class NauticaObfuscator {
    constructor() {
        this.level = 'medium';
        this.apiKeyValid = false;
        this.apiKey = null;
        this.nauticaId = 'nautica-' + Math.random().toString(36).substr(2, 8) + '-' + Math.random().toString(36).substr(2, 4);
    }

    // Generate hidden link
    generateHiddenLink() {
        const randomId = 'nautica-' + Math.random().toString(36).substr(2, 8) + '-' + 
                        Math.random().toString(36).substr(2, 4) + '-' + 
                        Math.random().toString(36).substr(2, 4);
        
        const timestamp = Date.now();
        const signature = this.generateSignature(randomId, timestamp);
        
        return {
            id: randomId,
            timestamp: timestamp,
            signature: signature,
            embedCode: `--[[ NAUTICA_HIDDEN_LINK:${randomId} ]]\n--[[ TIMESTAMP:${timestamp} ]]\n--[[ SIGNATURE:${signature} ]]\nlocal _0x${Math.random().toString(36).substr(2, 8)} = 'https://api.nautica.obfuscator/verify?key=${randomId}&t=${timestamp}&s=${signature}'\n--[[ VERIFIED:${randomId} ]]--`
        };
    }

    generateSignature(id, timestamp) {
        let hash = 0;
        const str = id + timestamp + this.nauticaId;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }

    // Obfuscate string
    encodeString(str) {
        const methods = ['char', 'hex', 'mixed'];
        const method = methods[Math.floor(Math.random() * methods.length)];
        
        if (method === 'char') {
            const chars = [];
            for (let i = 0; i < str.length; i++) {
                chars.push(str.charCodeAt(i));
            }
            return `string.char(${chars.join(',')})`;
        } else if (method === 'hex') {
            let hex = '';
            for (let i = 0; i < str.length; i++) {
                hex += str.charCodeAt(i).toString(16);
            }
            return `(function() local t='${hex}' local r='' for i=1,#t,2 do r=r..string.char(tonumber(t:sub(i,i+1),16)) end return r end)()`;
        } else {
            const b64 = btoa(str);
            return `(function() local s='${b64}' return (function(s) return (s:gsub('..', function(c) return string.char(tonumber(c,16)) end)) end)((function(s) local h='' for i=1,#s do h=h..string.byte(s,i):format('%x') end return h end)(s)) end)()`;
        }
    }

    encodeNumber(num) {
        const r1 = Math.floor(Math.random() * 100) + 1;
        const r2 = Math.floor(Math.random() * 100) + 1;
        return `(${r1} + ${num - r1})`;
    }

    generateRandomName(length = 8) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
        let name = '';
        for (let i = 0; i < length; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        return name;
    }

    isReserved(word) {
        const reserved = ['if', 'then', 'else', 'elseif', 'end', 'for', 'while', 'do', 'return', 
                         'local', 'function', 'nil', 'true', 'false', 'and', 'or', 'not', 'break', 
                         'goto', 'in', 'repeat', 'until'];
        return reserved.includes(word);
    }

    obfuscate(code, level, features) {
        let result = code;
        
        // Remove comments
        if (features.removeComments) {
            result = result.replace(/--\[\[[\s\S]*?\]\]--/g, '');
            result = result.replace(/--.*$/gm, '');
        }
        
        // Rename variables
        if (features.renameVars) {
            const varMap = new Map();
            let counter = 0;
            
            result = result.replace(/\b(local\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match, local, varName) => {
                if (this.isReserved(varName)) return match;
                if (!varMap.has(varName)) {
                    varMap.set(varName, this.generateRandomName(features.varLength || 6));
                }
                return (local || '') + varMap.get(varName);
            });
        }
        
        // Encode strings
        if (features.encodeStrings) {
            result = result.replace(/"(.*?)"/g, (match, str) => {
                return this.encodeString(str);
            });
            result = result.replace(/'(.*?)'/g, (match, str) => {
                return this.encodeString(str);
            });
        }
        
        // Encode numbers
        if (features.encodeNumbers) {
            result = result.replace(/\b(\d{1,3})\b/g, (match, num) => {
                if (num.length <= 3) {
                    return this.encodeNumber(parseInt(num));
                }
                return match;
            });
        }
        
        // Add dead code
        if (features.addDeadCode && level !== 'light') {
            const deadCodeCount = level === 'extreme' ? 30 : level === 'heavy' ? 20 : 10;
            const deadCodes = [
                'if false then local _ = 1 end',
                'do local _ = "dead" end',
                'while false do break end',
                'if nil then local _ = 2 end',
                'do local _ = {} end'
            ];
            
            let lines = result.split('\n');
            for (let i = 0; i < deadCodeCount; i++) {
                const pos = Math.floor(Math.random() * lines.length);
                lines.splice(pos, 0, deadCodes[Math.floor(Math.random() * deadCodes.length)]);
            }
            result = lines.join('\n');
        }
        
        // Control flow obfuscation
        if (features.controlFlow && level === 'extreme') {
            result = `(function()\n${result}\nend)()`;
        }
        
        // Remove whitespace
        if (features.removeWhitespace) {
            result = result.replace(/\s+/g, ' ');
            result = result.replace(/;\s*;/g, ';');
        }
        
        // Inject hidden link
        if (features.injectHiddenLink) {
            const hiddenLink = this.generateHiddenLink();
            const lines = result.split('\n');
            const randomLine = Math.floor(Math.random() * lines.length);
            lines.splice(randomLine, 0, hiddenLink.embedCode);
            result = lines.join('\n');
        }
        
        // Inject API key check
        if (features.injectApiKeyCheck && this.apiKey) {
            const apiCheck = `
--[[ NAUTICA API KEY VERIFICATION ]]
local function verifyNauticaKey()
    local expected = "${this.generateSignature(this.nauticaId, Date.now())}"
    local provided = "${this.apiKey}"
    if provided ~= expected then
        error("Invalid Nautica API Key. Please obtain a valid key from nautica.obfuscator")
    end
    return true
end
verifyNauticaKey()
`;
            result = apiCheck + '\n' + result;
        }
        
        // Add anti-decompile
        if (features.antiDecompile) {
            result = `--[[ ANTI-DECOMPILE PROTECTION ACTIVE ]]\n--[[ OBFUSCATED BY NAUTICA v1.0 ]]\n--[[ ID: ${this.nauticaId} ]]\n\n${result}\n--[[ END OF PROTECTED SCRIPT ]]--`;
        }
        
        return result;
    }

    calculateStats(code) {
        const lines = code.split('\n').length;
        const chars = code.length;
        const sizeKb = (chars / 1024).toFixed(2);
        return { lines, chars, sizeKb };
    }
}

// UI Controller
class UIController {
    constructor() {
        this.obfuscator = new NauticaObfuscator();
        this.initElements();
        this.initEvents();
        this.initBackground();
        this.updateStats();
    }

    initElements() {
        this.inputArea = document.getElementById('inputScript');
        this.outputArea = document.getElementById('outputScript');
        this.obfuscateBtn = document.getElementById('obfuscateBtn');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.clearOutputBtn = document.getElementById('clearOutputBtn');
        this.loadExampleBtn = document.getElementById('loadExampleBtn');
        this.uploadFileBtn = document.getElementById('uploadFileBtn');
        this.copyOutputBtn = document.getElementById('copyOutputBtn');
        this.downloadOutputBtn = document.getElementById('downloadOutputBtn');
        
        this.lineCount = document.getElementById('lineCount');
        this.charCount = document.getElementById('charCount');
        this.sizeKb = document.getElementById('sizeKb');
        this.outputLineCount = document.getElementById('outputLineCount');
        this.outputCharCount = document.getElementById('outputCharCount');
        this.compressionRate = document.getElementById('compressionRate');
        
        this.levelBtns = document.querySelectorAll('.level-btn');
        
        this.renameVars = document.getElementById('renameVars');
        this.encodeStrings = document.getElementById('encodeStrings');
        this.encodeNumbers = document.getElementById('encodeNumbers');
        this.addDeadCode = document.getElementById('addDeadCode');
        this.removeComments = document.getElementById('removeComments');
        this.removeWhitespace = document.getElementById('removeWhitespace');
        this.controlFlow = document.getElementById('controlFlow');
        this.antiDecompile = document.getElementById('antiDecompile');
        this.injectHiddenLink = document.getElementById('injectHiddenLink');
        this.injectApiKeyCheck = document.getElementById('injectApiKeyCheck');
        
        this.modal = document.getElementById('apiModal');
        this.verifyApiBtn = document.getElementById('verifyApiBtn');
        this.demoKeyBtn = document.getElementById('demoKeyBtn');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
    }

    initEvents() {
        this.obfuscateBtn.addEventListener('click', () => this.checkApiAndObfuscate());
        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        this.clearOutputBtn.addEventListener('click', () => this.clearOutput());
        this.loadExampleBtn.addEventListener('click', () => this.loadExample());
        this.uploadFileBtn.addEventListener('click', () => this.uploadFile());
        this.copyOutputBtn.addEventListener('click', () => this.copyOutput());
        this.downloadOutputBtn.addEventListener('click', () => this.downloadOutput());
        
        this.levelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.levelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.obfuscator.level = btn.dataset.level;
            });
        });
        
        this.verifyApiBtn.addEventListener('click', () => this.verifyApiKey());
        this.demoKeyBtn.addEventListener('click', () => this.generateDemoKey());
        
        this.inputArea.addEventListener('input', () => this.updateStats());
    }

    initBackground() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 80; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 80 + 20;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = Math.random() * 10 + 15 + 's';
            particle.style.opacity = Math.random() * 0.3;
            particlesContainer.appendChild(particle);
        }
    }

    checkApiAndObfuscate() {
        if (!this.obfuscator.apiKeyValid) {
            this.modal.classList.add('active');
        } else {
            this.obfuscate();
        }
    }

    verifyApiKey() {
        const key = this.apiKeyInput.value;
        if (key.startsWith('NAUTICA-') && key.length >= 20) {
            this.obfuscator.apiKeyValid = true;
            this.obfuscator.apiKey = key;
            this.modal.classList.remove('active');
            this.showToast('API Key verified successfully!', 'success');
            this.obfuscate();
        } else {
            this.showToast('Invalid API key format!', 'error');
            this.apiKeyInput.style.borderColor = '#ff00ff';
            setTimeout(() => {
                this.apiKeyInput.style.borderColor = 'rgba(0, 255, 255, 0.2)';
            }, 2000);
        }
    }

    generateDemoKey() {
        const demoKey = 'NAUTICA-DEMO-' + Math.random().toString(36).substr(2, 8).toUpperCase() + 
                       '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        this.apiKeyInput.value = demoKey;
        this.showToast('Demo key generated! Click Verify to continue.', 'info');
    }

    obfuscate() {
        const input = this.inputArea.value;
        if (!input.trim()) {
            this.showToast('Please enter some code first!', 'error');
            return;
        }
        
        this.showLoading(true);
        
        setTimeout(() => {
            try {
                const features = {
                    renameVars: this.renameVars.checked,
                    encodeStrings: this.encodeStrings.checked,
                    encodeNumbers: this.encodeNumbers.checked,
                    addDeadCode: this.addDeadCode.checked,
                    removeComments: this.removeComments.checked,
                    removeWhitespace: this.removeWhitespace.checked,
                    controlFlow: this.controlFlow.checked,
                    antiDecompile: this.antiDecompile.checked,
                    injectHiddenLink: this.injectHiddenLink.checked,
                    injectApiKeyCheck: this.injectApiKeyCheck.checked,
                    varLength: 6
                };
                
                const output = this.obfuscator.obfuscate(input, this.obfuscator.level, features);
                this.outputArea.value = output;
                this.updateOutputStats(input, output);
                this.showToast('Script obfuscated successfully! Hidden link injected.', 'success');
            } catch(e) {
                console.error(e);
                this.showToast('Obfuscation failed: ' + e.message, 'error');
            }
            this.showLoading(false);
        }, 800);
    }

    updateStats() {
        const stats = this.obfuscator.calculateStats(this.inputArea.value);
        this.lineCount.textContent = stats.lines;
        this.charCount.textContent = stats.chars;
        this.sizeKb.textContent = stats.sizeKb;
    }

    updateOutputStats(input, output) {
        const stats = this.obfuscator.calculateStats(output);
        this.outputLineCount.textContent = stats.lines;
        this.outputCharCount.textContent = stats.chars;
        
        if (input && output) {
            const ratio = ((1 - output.length / input.length) * 100).toFixed(1);
            this.compressionRate.textContent = ratio;
        }
    }

    clearInput() {
        this.inputArea.value = '';
        this.updateStats();
        this.showToast('Input cleared', 'info');
    }

    clearOutput() {
        this.outputArea.value = '';
        this.outputLineCount.textContent = '0';
        this.outputCharCount.textContent = '0';
        this.compressionRate.textContent = '0';
        this.showToast('Output cleared', 'info');
    }

    loadExample() {
        this.inputArea.value = `-- Nautica Obfuscator Example
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local RunService = game:GetService("RunService")

print("Script loaded successfully!")

-- Auto farm example
LocalPlayer.CharacterAdded:Connect(function(character)
    print("Character loaded!")
    local humanoid = character:FindFirstChild("Humanoid")
    if humanoid then
        humanoid.WalkSpeed = 50
        humanoid.JumpPower = 80
    end
end)

-- Render loop
RunService.RenderStepped:Connect(function(deltaTime)
    -- Your render logic here
end)`;
        this.updateStats();
        this.showToast('Example loaded!', 'success');
    }

    uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.lua,.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.inputArea.value = e.target.result;
                this.updateStats();
                this.showToast(`Loaded: ${file.name}`, 'success');
            };
            reader.readAsText(file);
        };
        input.click();
    }

    copyOutput() {
        this.outputArea.select();
        document.execCommand('copy');
        this.showToast('Copied to clipboard!', 'success');
    }

    downloadOutput() {
        const output = this.outputArea.value;
        if (!output.trim()) {
            this.showToast('Nothing to download!', 'error');
            return;
        }
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nautica_obfuscated_${Date.now()}.lua`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Download started!', 'success');
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.add('active');
        } else {
            this.loadingOverlay.classList.remove('active');
        }
    }

    showToast(message, type = 'info') {
        this.toastMessage.textContent = message;
        const icon = this.toast.querySelector('i');
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#00ff88';
        } else if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = '#ff0066';
        } else {
            icon.className = 'fas fa-info-circle';
            icon.style.color = '#00ffff';
        }
        this.toast.classList.add('show');
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new UIController();
});
