<template>
  <div class="recharge-page">
    <!-- 充值卡片 -->
    <section class="recharge-card">
    <div class="card-header">
    <div class="card-header-left">
        <h2 class="card-title">USDT 充值</h2>
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

        <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载二维码...</p>
        </div>

        <!-- 二维码显示 -->
        <div v-else-if="qrcodeImage" class="qrcode-display">
            <div class="qrcode-image">
            <img 
                :src="qrcodeImage" 
                alt="USDT充值二维码"
                class="qrcode-img"
            />
            </div>
            <p class="qrcode-hint">扫描二维码充值</p>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../api/client'

// 响应式数据
const loading = ref(true)
const error = ref('')
const qrcodeImage = ref('')
const qrcodeId = ref('')

// 获取二维码
const fetchQRCode = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiClient.throttledGet('/wallet-bot/me/usdt-recharge/qrcode')
    
    if (response.data.data?.qrcode_image) {
      qrcodeImage.value = `data:image/png;base64,${response.data.data.qrcode_image}`
      console.log('二维码数据:', response.data.data)
      qrcodeId.value = response.data.data.qrcode_id || ''
    } else {
      throw new Error('未获取到二维码数据')
    }
  } catch (err) {
    console.error('获取二维码失败:', err)
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 钱包地址
let walletAddress = ref('')
const expanded = ref(false)
const copySuccess = ref(false)

async function loadUserInfo() {
  loading.value = true
  try {
    // 直接调用 API，拦截器会自动处理令牌
    const response = await apiClient.throttledGet('/wallet-bot/me')
    walletAddress.value = response.data.data.account.address || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
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

onMounted(() => {
  loadUserInfo()
  fetchQRCode()
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
  align-items: center;
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

.qrcode-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.qrcode-container {
  text-align: center;
  padding: 20px 0;
}

/* 加载状态 */
.loading-state {
  padding: 40px 20px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0088cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #999;
  font-size: 14px;
  margin: 0;
}

/* 二维码显示 */
.qrcode-display .qrcode-image {
  background: white;
  padding: 16px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 12px;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  display: block;
  border-radius: 4px;
}

.qrcode-hint {
  color: #666;
  font-size: 14px;
  margin: 12px 0 0;
}

/* 错误状态 */
.error-state {
  padding: 40px 20px;
}

.error-icon {
  width: 40px;
  height: 40px;
  border: 2px solid #f44336;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  color: #f44336;
  margin: 0 auto 12px;
}

.error-state p {
  color: #f44336;
  font-size: 14px;
  margin: 0;
}

/* 占位图状态 */
.qrcode-placeholder {
  padding: 30px 0;
}

.placeholder-image {
  opacity: 0.5;
  margin-bottom: 12px;
}

.qrcode-placeholder .qrcode-hint {
  color: #999;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .qrcode-img {
    width: 180px;
    height: 180px;
  }
  
  .section-title {
    font-size: 16px;
  }
}

/* 修改 .recharge-card */
.recharge-card {
  padding: 16px; /* 原20px → 16px */
  margin-bottom: 12px; /* 原16px → 12px */
}

/* 修改卡片头部间距 */
.card-header {
  margin-bottom: 16px; /* 原20px → 16px */
  padding-bottom: 12px; /* 原16px → 12px */
}

/* 修改货币信息区域间距 */
.currency-info {
  gap: 8px; /* 原12px → 8px */
  margin-bottom: 20px; /* 原24px → 20px */
}

.info-item {
  padding: 8px 0; /* 原12px → 8px */
  min-height: 32px; /* 添加最小高度避免过小 */
}

/* 减小二维码区域内边距 */
.qrcode-section {
  padding: 16px; /* 原20px → 16px */
  margin-bottom: 20px; /* 原24px → 20px */
}

.qrcode-container {
  padding: 12px 0; /* 原20px → 12px */
}

/* 减小二维码图片周围空白 */
.qrcode-display .qrcode-image {
  padding: 12px; /* 原16px → 12px */
  margin-bottom: 8px; /* 原12px → 8px */
}

.qrcode-img {
  width: 180px; /* 原200px → 180px */
  height: 180px; /* 原200px → 180px */
}

/* 紧凑说明区域 */
.instructions {
  padding: 12px 16px; /* 原16px → 12px 16px */
  margin-bottom: 0; /* 移除底部边距 */
}

.instructions-header {
  margin-bottom: 10px; /* 原12px → 10px */
}

.instruction-item {
  margin-bottom: 8px; /* 原10px → 8px */
  padding: 4px 0; /* 添加内边距 */
}

/* 调整标题大小 */
.card-title {
  font-size: 17px; /* 原18px → 17px */
}

.section-title {
  font-size: 16px; /* 原18px → 16px */
}

/* 调整说明文字 */
.instruction-text {
  font-size: 12px; /* 原10px → 12px（更清晰） */
  line-height: 1.4; /* 原1.5 → 1.4 */
}

.qrcode-hint {
  font-size: 13px; /* 原14px → 13px */
  margin: 8px 0 0; /* 调整边距 */
}

/* 让信息项更紧凑 */
.info-label {
  font-size: 13px; /* 原14px → 13px */
  min-width: 36px; /* 原40px → 36px */
  padding-top: 0; /* 移除上边距 */
}

.info-content {
  margin-left: 12px; /* 原16px → 12px */
}

/* 徽章更紧凑 */
.currency-badge, .network-badge {
  padding: 6px 10px; /* 原8px 12px → 6px 10px */
  font-size: 13px; /* 原14px → 13px */
}

@media (max-width: 420px) {
  .recharge-card {
    padding: 12px; /* 更紧凑 */
  }
  
  .content {
    padding: 4px 8px; /* 原6px 12px → 4px 8px */
  }
  
  .qrcode-img {
    width: 160px; /* 更小 */
    height: 160px;
  }
  
  .info-item {
    padding: 6px 0; /* 更紧凑 */
  }
}

/* 调整二维码区域 - 减少上下间距 */
.qrcode-section {
  background: white;
  border-radius: 12px;
  padding: 12px 16px; /* 保持左右内边距，减少上下内边距 */
  margin-bottom: 12px; /* 大幅减少底部外边距：原20px → 12px */
  margin-top: 4px; /* 添加或调整顶部外边距，减少与地址的间距 */
}

/* 如果二维码容器仍有额外的内边距 */
.qrcode-container {
  text-align: center;
  padding: 8px 0; /* 减少容器内边距：原12px 0 → 8px 0 */
}

/* 确保二维码图片没有额外的外边距 */
.qrcode-display .qrcode-image {
  background: white;
  padding: 8px; /* 如果仍有内边距，可以减少 */
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 4px; /* 大幅减少图片底部外边距 */
}

.qrcode-img {
  width: 180px; /* 保持原大小 */
  height: 180px;
  display: block;
  border-radius: 4px;
}

.qrcode-hint {
  color: #666;
  font-size: 13px;
  margin: 4px 0 0; /* 大幅减少提示文字上边距：原8px → 4px */
}

/* 如果说明区域顶部间距也过大，可以一起调整 */
.instructions {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 16px;
  margin-top: 4px; /* 减少说明区域的上边距，让它更贴近二维码 */
}

/* 添加二维码显示区域样式 */
.qrcode-display {
  width: 100%; /* 确保占满宽度 */
  text-align: center; /* 居中文本内容 */
  margin-top: 8px; /* 与地址的间距 */
  padding: 12px 0; /* 上下内边距 */
}

/* 二维码图片容器 */
.qrcode-image {
  display: flex;
  justify-content: center; /* 水平居中 */
  margin-bottom: 6px; /* 与提示文字的间距 */
}

/* 二维码图片 */
.qrcode-img {
  width: 160px; /* 可以根据需要调整 */
  height: 160px;
  border-radius: 4px;
}

/* 二维码提示文字 */
.qrcode-hint {
  font-size: 13px;
  color: var(--tg-text-secondary);
  text-align: center; /* 确保文字居中 */
  margin: 0;
  line-height: 1.4;
}

/* 加载状态也要居中 */
.loading-state {
  width: 100%;
  text-align: center;
  padding: 20px 0;
}

.loading-spinner {
  margin: 0 auto 8px; /* 居中并添加下边距 */
}

</style>