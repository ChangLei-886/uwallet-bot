<template>
  <div class="withdraw-page">
    <!-- 提现卡片 -->
    <section class="withdraw-card">
      <div class="card-header">
        <div class="card-header-left">
          <h2 class="card-title">USDT 提现</h2>
        </div>
        
        <!-- 账单按钮 -->
        <button class="bill-button" @click="$router.push('/bill')" title="查看账单" aria-label="查看账单">
          <svg class="bill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V5a2 2 0 0 0-2-2H7L3 6v11a2 2 0 0 0 2 2h12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="bill-text">账单</span>
        </button>
      </div>
      
      <!-- 地址和网络区域 -->
      <div class="address-network-section">
        <div class="section-header">
          <h3 class="section-title">地址和网络</h3>
        </div>
        <div class="address-network-container">
          <!-- 地址输入行 -->
          <div class="address-row">
            <div class="address-input-container">
              <textarea
                v-model="withdrawAddress"
                type="text"
                placeholder="输入或粘贴 USDT 地址"
                class="address-input"
                rows="1"
                spellcheck="false"
                @input="autoResizeTextarea"
              ></textarea>
              <button class="scan-button" @click="handleScan" title="扫码">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- 四个角的缺口 -->
                  <path d="M3 3H8V5H5V8H3V3Z" fill="currentColor"/>
                  <path d="M21 3H16V5H19V8H21V3Z" fill="currentColor"/>
                  <path d="M3 21H8V19H5V16H3V21Z" fill="currentColor"/>
                  <path d="M21 21H16V19H19V16H21V21Z" fill="currentColor"/>
                  <!-- 中间减号 -->
                  <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 网络显示行 -->
          <div class="network-row">
            <div class="network-value">TRC20</div>
          </div>
        </div>
      </div>
      
      <!-- 提现金额区域 -->
      <div class="amount-section">
        <div class="section-header">
          <h3 class="section-title">提现金额</h3>
        </div>
        
        <!-- 金额输入 -->
        <div class="amount-input-container">
          <div class="currency-symbol">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#26A17B" stroke-width="1.2"/>
              <path d="M12 6V18M8 9H12M8 15H12M16 9H12M16 15H12" stroke="#26A17B" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            <span>USDT</span>
          </div>
          <input
            v-model.number="withdrawAmount"
            type="number"
            placeholder="0.00"
            class="amount-input"
          />
          <button class="max-button" @click="setMaxAmount">最大</button>
        </div>
        
        <!-- 可用余额 -->
        <div class="balance-info">
          <span class="balance-label">可用余额</span>
          <span class="balance-amount">{{ availableBalance }} USDT</span>
        </div>
        
        <!-- 费用和总计 -->
        <div class="fee-summary">
          <div class="fee-item">
            <span class="fee-label">手续费</span>
            <span class="fee-amount">{{ feeAmount }} USDT</span>
          </div>
          <div class="fee-item total">
            <span class="fee-label">预计到账</span>
            <span class="fee-amount">{{ totalAmount }} USDT</span>
          </div>
        </div>
      </div>
      
      <!-- 橙色说明区域 -->
      <div class="warning-section">
        <div class="warning-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2"/>
                <path d="M12 8V12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <span class="warning-text">    *请仔细核对提币地址与网络，避免造成资产浪费</span>
        </div>
      </div>
      
      <!-- 立即提现按钮 -->
      <div class="submit-section">
        <button class="submit-btn" @click="handleWithdraw">
          立即提现
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const withdrawAddress = ref('TTJkAoq2zceVem1y8Z9ojG4Eb5dGBAVSTX')
const withdrawAmount = ref('')
const availableBalance = ref('1000.00') // 示例余额，实际应从API获取
const feeRate = 0.001 // 手续费率 0.1%

const handleWithdraw = () => {
  // 直接使用全局的 $toast
  window.$toast('提现成功')
  
//   // 或者带时长
//   window.$toast('提现申请已提交', 3000)
}

// 计算手续费和总额
const feeAmount = computed(() => {
  const amount = parseFloat(withdrawAmount.value) || 0
  return (amount * feeRate).toFixed(2)
})

const totalAmount = computed(() => {
  const amount = parseFloat(withdrawAmount.value) || 0
  const fee = parseFloat(feeAmount.value) || 0
  return (amount - fee).toFixed(2)
})

// 设置最大金额
const setMaxAmount = () => {
  withdrawAmount.value = availableBalance.value
}

// 扫码功能
const handleScan = () => {
  // 扫码逻辑，这里留空，根据实际扫码功能实现
  console.log('打开扫码功能')
}
</script>

<style scoped>
.withdraw-page {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  padding: 16px;
  box-sizing: border-box;
}

/* 提现卡片 */
.withdraw-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(31,45,61,0.08);
  max-width: 480px;
  margin: 0 auto;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--tg-text);
  white-space: nowrap;
}

/* 账单按钮 */
.bill-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  color: var(--tg-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bill-button:hover {
  background: rgba(0, 0, 0, 0.04);
}

.bill-icon {
  opacity: 0.9;
}

@media (max-width: 420px) {
  .bill-text {
    display: none;
  }
  
  .bill-button {
    padding: 8px;
  }
}

/* 地址和网络区域 */
.address-network-section {
  margin-bottom: 16px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--tg-text);
}

/* 地址和网络容器 */
.address-network-container {
  border: 1px solid #e6eef8;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

/* 地址行 */
.address-row {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #e6eef8;
  min-height: 52px;
}

.address-label {
  font-size: 13px;
  color: var(--tg-text-secondary);
  min-width: 36px;
  margin-right: 12px;
  flex-shrink: 0;
  padding-top: 8px;
}

.address-input-container {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: flex-start;
}

.address-input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: none; /* 移除输入框边框 */
  border-radius: 4px;
  font-size: 13px;
  color: var(--tg-text);
  background: transparent; /* 透明背景 */
  line-height: 1.4;
  min-height: 36px;
  height: 36px; /* 初始高度 */
  max-height: 120px; /* 最大高度限制 */
  outline: none;
  resize: none; /* 禁用手动调整大小 */
  overflow-y: auto; /* 垂直滚动 */
  word-break: break-all;
  white-space: pre-wrap;
  font-family: inherit; /* 继承字体 */
}

.address-input::placeholder {
  color: var(--tg-text-secondary);
  opacity: 0.6;
}

.address-input:focus {
  background: white;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
}

/* 扫码按钮 */
.scan-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent; /* 透明背景 */
  border: none; /* 移除边框 */
  border-radius: 6px;
  color: var(--tg-text);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  align-self: flex-start;
}

.scan-button:hover {
  background: rgba(64, 158, 255, 0.1);
  color: var(--tg-accent);
}

/* 网络行 */
.network-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
}

.network-label {
  font-size: 13px;
  color: var(--tg-text-secondary);
  min-width: 36px;
  margin-right: 12px;
  flex-shrink: 0;
}

.network-value {
  font-size: 12px;
  color: var(--tg-text);
  font-weight: 500;
  padding: 4px 10px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  color: var(--tg-accent);
}

/* 金额输入区域 */
.amount-section {
  margin-bottom: 16px;
}

.amount-input-container {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
  height: 52px;
}

.amount-input-container:focus-within {
  border-color: var(--tg-accent);
}

.currency-symbol {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  font-size: 15px;
  font-weight: 500;
  color: #26A17B;
  background: white;
  height: 52px;
  border-right: 1px solid #e6eef8;
  flex-shrink: 0;
}

.amount-input {
  flex: 1;
  border: none;
  padding: 14px 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--tg-text);
  outline: none;
  min-width: 0;
  background: transparent;
}

.amount-input::placeholder {
  color: var(--tg-text-secondary);
  opacity: 0.6;
}

.max-button {
  padding: 0 16px;
  height: 52px;
  background: var(--tg-accent);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.max-button:hover {
  background: #1d7ef0;
}

/* 可用余额 */
.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-top: 10px;
}

.balance-label {
  font-size: 13px;
  color: var(--tg-text-secondary);
}

.balance-amount {
  font-size: 14px;
  font-weight: 500;
  color: #26A17B;
}

/* 费用和总计 */
.fee-summary {
  margin-top: 10px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: var(--tg-text);
}

.fee-item.total {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  font-weight: 600;
  color: var(--tg-text);
}

.fee-label {
  font-size: 14px;
}

.fee-amount {
  font-size: 14px;
  font-weight: 500;
}

/* 橙色警告区域 */
.warning-section {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
  color: #ea580c;
}

.warning-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #ea580c;
}

.warning-text {
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
  color: #ea580c;
}

/* 提交按钮 */
.submit-section {
  text-align: center;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px;
  background: var(--tg-accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  background: linear-gradient(135deg, var(--tg-accent), #1d7ef0);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 420px) {
  .withdraw-page {
    padding: 0;
  }
  
  .withdraw-card {
    padding: 16px;
    border-radius: 0;
  }
  
  .card-header {
    padding-bottom: 10px;
    margin-bottom: 14px;
  }
  
  .address-row,
  .network-row {
    padding: 10px;
  }
  
  .address-label,
  .network-label {
    min-width: 32px;
    margin-right: 8px;
    font-size: 12px;
  }
  
  .address-input {
    font-size: 12px;
    padding: 6px 10px;
    min-height: 34px;
    height: 42px;
  }
  
  .scan-button {
    width: 36px;
    height: 36px;
  }
  
  .network-value {
    font-size: 11px;
    padding: 3px 8px;
  }
  
  .amount-input-container {
    height: 48px;
  }
  
  .currency-symbol {
    height: 48px;
    padding: 0 10px;
    font-size: 14px;
  }
  
  .amount-input {
    padding: 12px 10px;
    font-size: 15px;
  }
  
  .max-button {
    height: 48px;
    padding: 0 12px;
    font-size: 13px;
  }
  
  .balance-label,
  .balance-amount {
    font-size: 12px;
  }
  
  .fee-label,
  .fee-amount {
    font-size: 13px;
  }
  
  .warning-section {
    padding: 12px;
  }
  
  .warning-title {
    font-size: 13px;
  }
  
  .warning-text {
    font-size: 12px;
  }
  
  .submit-btn {
    padding: 14px;
    font-size: 14px;
  }
}
</style>