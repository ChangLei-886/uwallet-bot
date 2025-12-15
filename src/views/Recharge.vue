<template>
  <div class="recharge-page">
    <div class="content">
      <!-- 充值卡片 -->
      <section class="recharge-card">
        <div class="card-header">
        <div class="card-header-left">
            <h2 class="card-title">USDT 充值</h2>
        </div>
        
        <!-- 账单按钮 -->
        <button class="bill-button" @click="$router.push('/me')" title="查看账单" aria-label="查看账单">
            <svg class="bill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V5a2 2 0 0 0-2-2H7L3 6v11a2 2 0 0 0 2 2h12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="bill-text">账单</span>
        </button>
        </div>
        
        <!-- 币种信息 -->
        <div class="currency-info">
          <div class="info-item">
            <span class="info-label">币种</span>
            <div class="info-content">
              <div class="currency-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="#26A17B" stroke-width="1.2"/>
                  <path d="M12 6V18M8 9H12M8 15H12M16 9H12M16 15H12" stroke="#26A17B" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <span class="currency-name">USDT</span>
              </div>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-label">网络</span>
            <div class="info-content">
              <span class="network-badge">TRC20</span>
            </div>
          </div>

          <!-- 地址部分 - 与币种、网络相同的风格 -->
          <div class="info-item">
            <span class="info-label">地址</span>
            <div class="info-content">
                <div class="address-display" @click="toggleAddressExpand" style="cursor: pointer;">
                    <code class="address-code">
                        {{ expanded ? walletAddress : shortAddress }}
                    </code>
                    <div class="address-actions">
                        <button class="address-copy" @click.stop="copyAddress" :title="copySuccess ? '已复制' : '复制地址'">
                            <svg v-if="!copySuccess" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
        
        <!-- 二维码 -->
        <div class="qrcode-section">
          <div class="section-header">
            <h3 class="section-title">二维码</h3>
          </div>
          <div class="qrcode-container">
            <div class="qrcode-placeholder">
              <!-- 这里可以放置真实的二维码 -->
              <div class="qrcode-image">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- 简单的二维码示意 -->
                  <rect width="120" height="120" fill="#fff"/>
                  <rect x="10" y="10" width="100" height="100" stroke="#333" stroke-width="2"/>
                  <!-- 三个定位角 -->
                  <rect x="15" y="15" width="25" height="25" fill="#333"/>
                  <rect x="80" y="15" width="25" height="25" fill="#333"/>
                  <rect x="15" y="80" width="25" height="25" fill="#333"/>
                  <!-- 数据块示意 -->
                  <rect x="50" y="50" width="20" height="20" fill="#333"/>
                  <rect x="50" y="75" width="10" height="10" fill="#333"/>
                  <rect x="75" y="50" width="10" height="10" fill="#333"/>
                </svg>
              </div>
              <p class="qrcode-hint">扫描二维码充值</p>
            </div>
          </div>
        </div>

        <!-- 充值说明 -->
        <div class="instructions">
          <div class="instructions-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2"/>
              <path d="M12 8V12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <h3 class="instructions-title">充值说明</h3>
          </div>
          <ul class="instruction-list">
            <li class="instruction-item">
              <span class="instruction-number">1</span>
              <span class="instruction-text">仅支持 TRC20 网络的 USDT 充值</span>
            </li>
            <li class="instruction-item">
              <span class="instruction-number">2</span>
              <span class="instruction-text">请勿向此地址充值其他币种或使用其他网络</span>
            </li>
            <li class="instruction-item">
              <span class="instruction-number">3</span>
              <span class="instruction-text">充值完成后，金额会自动添加到您的余额</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 钱包地址
const walletAddress = ref('TNPqLpM1Y3wGjqM4K5n6b7c8d9e0f1g2h3i4j5k')
const expanded = ref(false)
const copySuccess = ref(false)
// 充值金额相关
const amount = ref('')
const amountError = ref('')
const quickAmounts = [5, 10, 50, 100]

// 设置金额
function setAmount(value) {
  amount.value = value.toString()
  validateAmount()
}

// 验证金额
function validateAmount() {
  if (!amount.value) {
    amountError.value = ''
    return
  }
  
  const numAmount = parseFloat(amount.value)
  
  if (isNaN(numAmount) || numAmount < 10) {
    amountError.value = '最小充值金额为 10 USDT'
  } else if (numAmount > 10000) {
    amountError.value = '单次充值金额不能超过 10,000 USDT'
  } else {
    amountError.value = ''
  }
}

// 计算缩短地址
const shortAddress = computed(() => {
  const addr = walletAddress.value
  if (!addr || addr.length <= 14) return addr
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`
})

// 复制地址
function copyAddress() {
  try {
    navigator.clipboard.writeText(walletAddress.value)
    window.dispatchEvent(new CustomEvent('app:toast', { detail: '地址已复制' }))
    copySuccess.value = true
    setTimeout(() => (copySuccess.value = false), 1200)
  } catch (e) {
    console.warn('复制失败', e)
  }
}

// 切换地址显示
function toggleAddressExpand() {
  expanded.value = !expanded.value
}

// 返回首页
function goHome() {
  router.push('/')
}

onMounted(() => {
  // 可以在这里请求用户的充值地址
  // fetchUserWalletAddress()
})
</script>

<style scoped>
.recharge-page {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

/* 内容区域 */
.content {
  width: 100%;
  max-width: 720px;
  margin: 18px auto 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 6px 12px;
  box-sizing: border-box;
}

/* 充值卡片 */
.recharge-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 30px rgba(31,45,61,0.06);
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  color: var(--tg-accent);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--tg-text);
  white-space: nowrap;  /* 防止标题换行 */
}

/* 币种信息 */
.currency-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;  /* 关键 */
  max-width: 100%;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.info-label {
  font-size: 14px;
  color: var(--tg-text-secondary);
}

.info-content {
  display: table-cell;
  align-items: center;
  gap: 8px;
  width: auto;  /* 表格会自动分配 */
}

.currency-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(38, 161, 123, 0.1);
  border-radius: 8px;
  color: #26A17B;
  font-weight: 500;
}

.network-badge {
  padding: 6px 12px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  color: var(--tg-accent);
  font-weight: 500;
  font-size: 14px;
}

/* 地址部分 */
.address-section {
  background: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e6eef8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--tg-text);
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  color: var(--tg-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.address-display {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e6eef8;
}

.address-code {
  display: block;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
  color: var(--tg-text);
  word-break: break-all;
  line-height: 1.5;
  margin-bottom: 8px;
}

.address-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--tg-text-secondary);
}

/* 二维码部分 */
.qrcode-section {
  margin-bottom: 24px;
}

.qrcode-container {
  text-align: center;
}

.qrcode-placeholder {
  display: inline-block;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e6eef8;
}

.qrcode-image {
  margin-bottom: 12px;
}

.qrcode-hint {
  font-size: 13px;
  color: var(--tg-text-secondary);
  margin: 0;
}

/* 说明部分 */
.instructions {
  background: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e6eef8;
  color: #ea580c; /* 橙色 */
}

.instructions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.instructions-title {
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  /* color: var(--tg-text); */
  color: #ea580c; /* 橙色 */
}

.instruction-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.instruction-item:last-child {
  margin-bottom: 0;
}

.instruction-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--tg-accent);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.instruction-text {
  font-size: 10px;
  /* color: var(--tg-text); */
  line-height: 1.5;
  flex: 1;
  color: #ea580c; /* 橙色 */
}

/* 历史记录部分 */
.history-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 30px rgba(31,45,61,0.06);
}

.view-all {
  background: transparent;
  border: none;
  color: var(--tg-accent);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.view-all:hover {
  background: rgba(64, 158, 255, 0.1);
}

.history-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-text-secondary);
}

.history-empty p {
  margin-top: 12px;
  font-size: 14px;
}

/* 金额输入部分样式 */
.amount-section {
  background: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e6eef8;
}

.amount-input-wrapper {
  margin-top: 12px;
}

.amount-input {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e6eef8;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.amount-input:focus-within {
  border-color: var(--tg-accent);
}

.currency-symbol {
  padding: 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--tg-text);
  background: #f8fafc;
  height: 56px;
  display: flex;
  align-items: center;
  border-right: 1px solid #e6eef8;
}

.amount-field {
  flex: 1;
  border: none;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--tg-text);
  outline: none;
  min-width: 0;
}

.amount-field::placeholder {
  color: var(--tg-text-secondary);
  opacity: 0.6;
}

.currency-unit {
  padding: 0 16px;
  font-size: 16px;
  color: var(--tg-text);
  background: #f8fafc;
  height: 56px;
  display: flex;
  align-items: center;
  border-left: 1px solid #e6eef8;
}

.amount-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  /* color: var(--tg-text-secondary); */
  color: #ea580c; /* 橙色 */
  margin-top: 8px;
}

.amount-hint svg {
  stroke: #ea580c; /* 图标也改成橙色 */
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 16px;
}

@media (min-width: 420px) {
  .quick-amounts {
    grid-template-columns: repeat(4, 1fr);
  }
}

.quick-amount-btn {
  padding: 10px;
  background: #fff;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  color: var(--tg-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-amount-btn:hover {
  border-color: var(--tg-accent);
  color: var(--tg-accent);
}

.quick-amount-btn.active {
  background: var(--tg-accent);
  border-color: var(--tg-accent);
  color: white;
}

.amount-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #dc2626;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(220, 38, 38, 0.05);
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 720px) {
  .content { margin: 12px }
}

@media (max-width: 420px) {
  .recharge-page { padding: 0 }
  .content { margin: 0; padding: 0 12px; max-width: 100% }
  .recharge-card { padding: 16px }
  .card-header { padding-bottom: 12px; margin-bottom: 16px }
  .address-section, .instructions { padding: 12px }
  /* .history-section { padding: 16px } */
  .copy-text { display: none }
  .icon-button { width: 32px; height: 32px }
  .logo { width: 40px; height: 40px }
  .logo-svg { width: 40px; height: 40px }
}

/* 卡片头部布局 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;  /* 左右分布 */
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 账单按钮样式 */
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
  transform: translateY(-1px);
}

.bill-icon {
  opacity: 0.9;
}

.bill-text {
  font-size: 14px;
}

/* 移动端适配 */
@media (max-width: 420px) {
  .bill-text {
    display: none;  /* 移动端只显示图标 */
  }
  
  .bill-button {
    padding: 8px;
  }
}

/* 提交按钮部分 */
.submit-section {
  margin-top: 24px;
  text-align: center;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 24px;
  background: var(--tg-accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.submit-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  background: linear-gradient(135deg, var(--tg-accent), #1d7ef0);
}

.submit-btn:active:not(.disabled) {
  transform: translateY(0);
}

.submit-btn.disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.submit-hint {
  font-size: 12px;
  color: var(--tg-text-secondary);
  margin-top: 8px;
  opacity: 0.8;
}

/* 信息项通用样式 */
.info-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--tg-text-secondary);
  min-width: 40px;
  padding-top: 2px;
}

.info-content {
  flex: 1;
  margin-left: 16px;
  width: 100%;  /* 加上这个 */
}

/* 地址显示样式 */
.address-display {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.2s;
}

.address-display:hover {
  background: #f1f5f9;
  border-color: #dbeafe;
}

.address-code {
  flex: 1;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12px;
  color: var(--tg-text);
  word-break: break-all;
  line-height: 1.4;
  user-select: text;
}

.address-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.address-copy,
.address-expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: white;
  border: 1px solid #e6eef8;
  border-radius: 6px;
  color: var(--tg-text);
  cursor: pointer;
  transition: all 0.2s;
}

.address-copy:hover,
.address-expand:hover {
  background: #f8fafc;
  border-color: var(--tg-accent);
  color: var(--tg-accent);
}

/* 地址提示 */
.address-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--tg-text-secondary);
  margin-top: 6px;
  opacity: 0.8;
}

/* 币种和网络徽章 */
.currency-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(38, 161, 123, 0.1);
  border-radius: 8px;
  color: #26A17B;
  font-weight: 500;
}

.network-badge {
  display: inline-block;
  padding: 8px 12px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  color: var(--tg-accent);
  font-weight: 500;
  font-size: 14px;
}

/* 移动端适配 */
@media (max-width: 420px) {
  .info-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .info-label {
    min-width: auto;
    padding-top: 0;
  }
  
  .info-content {
    margin-left: 0;
    width: 100%;
  }
  
  .address-display {
    padding: 8px 10px;
  }
  
  .address-code {
    font-size: 11px;
  }
  
  .address-copy,
  .address-expand {
    width: 24px;
    height: 24px;
  }
}

</style>