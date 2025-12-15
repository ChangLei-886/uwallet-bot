<template>
  <div class="home">
    <header class="top">
      <div class="content header-row">
        <div class="logo" aria-hidden="false" role="img" aria-label="汇旺飞机钱包">
          <!-- Inline SVG logo: stylized HW with paper-plane motif -->
          <svg class="logo-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" focusable="false">
            <defs>
              <linearGradient id="lg" x1="0" x2="1">
                <stop offset="0" stop-color="#62a8ff" />
                <stop offset="1" stop-color="#2b8eff" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="12" fill="url(#lg)" />
            <g transform="translate(6,6) scale(0.8)" fill="#fff">
              <path d="M6 30 L54 6 L38 38 L30 54 Z" opacity="0.95" />
              <path d="M10 28 L34 32 L28 36 L14 30 Z" opacity="0.15" />
            </g>
          </svg>
        </div>
        <div class="header-icons">
          <button class="icon-button help-btn" title="帮助" aria-label="帮助">
            <svg class="help-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="var(--tg-accent)" stroke-width="1.2"/>
              <path d="M12 16V14" stroke="var(--tg-accent)" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M12 12C12 10.5 13 9.5 14 9C14.5 8.5 15 7.5 14.5 6.5C14 5.5 13 5 12 5C10.5 5 9.5 6 9.5 7.5" stroke="var(--tg-accent)" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="icon-button support-btn" title="客服" aria-label="联系客服">
            <svg class="support-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 头部 -->
              <circle cx="12" cy="9" r="3" stroke="var(--tg-text)" stroke-width="1.2" fill="none"/>
            
              <!-- 身体 -->
              <path d="M9 12C9 14 10 16 12 16C14 16 15 14 15 12" stroke="var(--tg-text)" stroke-width="1.2" stroke-linecap="round"/>
            
              <!-- 耳麦 -->
              <path d="M6 9C6 7 7 5 9 5" stroke="var(--tg-text)" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M18 9C18 7 17 5 15 5" stroke="var(--tg-text)" stroke-width="1.2" stroke-linecap="round"/>
              <circle cx="7" cy="9" r="1" stroke="var(--tg-text)" stroke-width="1.2" fill="none"/>
              <circle cx="17" cy="9" r="1" stroke="var(--tg-text)" stroke-width="1.2" fill="none"/>
            
              <!-- 麦克风 -->
              <path d="M12 16V19" stroke="var(--tg-text)" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M10 19H14" stroke="var(--tg-text)" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="content">
      <section class="user-card">
       <div class="user-top" style="display:flex;align-items:center;gap:12px">
        <div style="flex:1">
          <div class="user-name muted"><strong>{{ userName }}</strong></div>
          <div class="user-id" style="display:flex;align-items:center;gap:8px;" >
            <span style="font-size:13px; color:#666; padding:0; margin:0;">ID:</span>
            <span style="font-size:13px; padding:0; margin:0 0 0 2px;">{{ userId }}</span>

            <button class="copy-user" @click.stop="copyUserId" :title="userCopySuccess ? '已复制' : '复制用户ID'">
              <svg v-if="!userCopySuccess" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="copy-text">复制</span>
            </button>
          </div>
          <div class="address" @click="toggleAddressExpand" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
            <span class="label muted" style="font-size: 13px; color: var(--tg-text-secondary); min-width: 55px;">TRC20:</span>

            <div class="address-content" style="flex:1; display:flex; align-items:center; gap:8px; cursor:pointer;">
                <code class="address-value" style="font-size: 13px; font-family: 'SF Mono', Monaco, Consolas, monospace;">
                {{ expanded ? address : shortAddress() }}
                </code>
            </div>

            <button class="copy-btn" @click.stop="copyAddress" :title="copySuccess ? '已复制' : '复制地址'" aria-live="polite">
              <svg v-if="!copySuccess" class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else class="copy-icon success" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="copy-text">复制</span>
            </button>
          </div>
        </div>
       </div>

       <div class="balance-row" style="margin-top:12px; display:flex; flex-direction:column; align-items:flex-start; width:100%;">
        <div style="display:flex; align-items:center; gap:12px; width:100%; justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px; justify-content:flex-start;">
            <div class="balance-label muted">余额折合(USDT)</div>
            <button class="icon-eye" @click="toggleMask" :aria-pressed="!masked" title="切换余额显示" style="margin-left:8px;">
              <svg v-if="!masked" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7a11 11 0 0 1 4.16-5.45" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 1l22 22" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div style="margin-left:auto;">
            <button class="bill-button" @click="$router.push('/bill')" title="查看账单" aria-label="查看账单">
              <svg class="bill-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right:6px" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V5a2 2 0 0 0-2-2H7L3 6v11a2 2 0 0 0 2 2h12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="bill-text">账单</span>
              <svg class="bill-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div style="margin-top:8px">
          <div class="balance-value">{{ masked ? '*****' : balance }}</div>
        </div>
      </div>
      </section>

      <section class="shortcuts">
          <button @click="$router.push('/recharge')" class="btn primary">
            <!-- <RechargeIcon :size="22" stroke="var(--tg-accent)" :strokeWidth="1.6" />
            <span>充值</span> -->
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V8M12 8L15 5M12 8L9 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <rect x="3" y="10" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/>
                <circle cx="12" cy="16" r="2" stroke="currentColor" stroke-width="1.2"/>
            </svg>
            <span>充值</span>
          </button>
          <button @click="$router.push('/withdraw')" class="btn">
            <!-- <WithdrawIcon :size="22" stroke="var(--tg-accent)" :strokeWidth="1.6" />
            <span>提现</span> -->
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 22V16M12 16L9 19M12 16L15 19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <rect x="3" y="2" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/>
                <circle cx="12" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/>
            </svg>
            <span>提现</span>
          </button>
        <button class="btn disabled">
          <!-- <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <span>红包</span> -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M20 12V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V12" stroke="currentColor" stroke-width="1.2"/>
            <path d="M22 7H2V12H22V7Z" stroke="currentColor" stroke-width="1.2"/>
            <path d="M12 22V7" stroke="currentColor" stroke-width="1.2"/>
            <path d="M12 7C12 5 13.5 2 16.5 2C19.5 2 21 5 21 7H12Z" stroke="currentColor" stroke-width="1.2"/>
            <path d="M12 7C12 5 10.5 2 7.5 2C4.5 2 3 5 3 7H12Z" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          <span>红包</span>
        </button>
        <button @click="$router.push('/settings')" class="btn">
          <!-- <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.26a1.65 1.65 0 0 0-1-.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 4.3 17.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-.51-1H3a2 2 0 1 1 0-4h.26c.2-.38.28-.81.51-1a1.65 1.65 0 0 0-.33-1.82L3.7 3.7A2 2 0 1 1 6.53.87l.06.06a1.65 1.65 0 0 0 1.82.33c.37-.2.78-.28 1-.51H12a2 2 0 1 1 0 4h-.26c-.2.2-.28.63-.51 1a1.65 1.65 0 0 0 .33 1.82l.06.06A2 2 0 1 1 17.7 6.1l-.06.06a1.65 1.65 0 0 0-.33 1.82c.2.37.28.78.51 1H21a2 2 0 1 1 0 4h-.26c-.2.2-.28.63-.51 1z" stroke="currentColor" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>设置</span> -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.2"/>
            <path d="M19.4 14.9C19.7 15.6 21 15.4 21.8 16.2C22.6 17 22.4 18.3 23.1 18.6C23.8 18.9 24 20.2 23.2 21C22.4 21.8 21.1 22 20.8 22.7C20.5 23.4 19.2 23.6 18.4 22.8C17.6 22 16.3 22.2 16 21.5C15.7 20.8 14.4 20.6 13.6 21.4C12.8 22.2 13 23.5 12.3 23.8C11.6 24.1 10.3 23.9 9.5 23.1C8.7 22.3 8.9 21 8.2 20.7C7.5 20.4 6.2 20.6 5.4 19.8C4.6 19 4.8 17.7 4.1 17.4C3.4 17.1 2.1 17.3 1.3 16.5C0.5 15.7 0.7 14.4 0 14.1C-0.7 13.8 -0.9 12.5 -0.1 11.7C0.7 10.9 2 11.1 2.3 10.4C2.6 9.7 3.9 9.5 4.7 10.3C5.5 11.1 5.3 12.4 6 12.7C6.7 13 8 12.8 8.8 13.6C9.6 14.4 9.4 15.7 10.1 16C10.8 16.3 12.1 16.1 12.9 15.3C13.7 14.5 13.5 13.2 14.2 12.9C14.9 12.6 16.2 12.8 17 12C17.8 11.2 17.6 9.9 18.3 9.6C19 9.3 20.3 9.5 21.1 8.7C21.9 7.9 21.7 6.6 22.4 6.3C23.1 6 23.3 4.7 22.5 3.9C21.7 3.1 20.4 3.3 20.1 2.6C19.8 1.9 18.5 1.7 17.7 2.5C16.9 3.3 17.1 4.6 16.4 4.9C15.7 5.2 14.4 5 13.6 5.8C12.8 6.6 13 7.9 12.3 8.2C11.6 8.5 10.3 8.3 9.5 7.5C8.7 6.7 8.9 5.4 8.2 5.1C7.5 4.8 6.2 5 5.4 4.2C4.6 3.4 4.8 2.1 4.1 1.8C3.4 1.5 2.1 1.7 1.3 0.9C0.5 0.1 0.7 -1.2 0 -1.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="translate(2,2) scale(0.8)"/>
          </svg>
          <span>设置</span>
        </button>
      </section>

      <!-- 新增的安全提示section -->
      <section class="security-tip">
        <div class="tip-content">
          <svg class="warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M12 17H12.01" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="#dc2626" stroke-width="1.2"/>
          </svg>
          <span class="tip-text">为保证钱包资金安全，建议开启谷歌验证码二次验证</span>
          <a href="/security" class="tip-link">
            <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../api/client'

const balance = ref('1000.00')
const masked = ref(false)
const expanded = ref(false)

const userId = ref('')
const address = ref('')
const userName = ref('')
let userInfo = ref(null)
const loading = ref(false)

function toggleMask() {
  masked.value = !masked.value
}

function copyAddress() {
  try {
    navigator.clipboard.writeText(address.value)
    const ev = new CustomEvent('app:toast', { detail: '地址已复制' })
    window.dispatchEvent(ev)
    setCopySuccess()
  } catch (e) {
    console.warn('复制失败', e)
  }
}

const avatarInitials = () => (address.value ? address.value.slice(0,2) : 'HW')
const shortAddress = () => (address.value ? `${address.value.slice(0,8)}...${address.value.slice(-6)}` : '')

function toggleAddressExpand() {
  expanded.value = !expanded.value
}

const copySuccess = ref(false)

function setCopySuccess() {
  copySuccess.value = true
  setTimeout(() => (copySuccess.value = false), 1200)
}

const userCopySuccess = ref(false)

function setUserCopySuccess() {
  userCopySuccess.value = true
  setTimeout(() => (userCopySuccess.value = false), 1200)
}

function copyUserId() {
  try {
    navigator.clipboard.writeText(userId.value)
    window.dispatchEvent(new CustomEvent('app:toast', { detail: '用户ID已复制' }))
    setUserCopySuccess()
  } catch (e) {
    console.warn('复制用户ID失败', e)
  }
}

async function loadUserInfo() {
  loading.value = true
  try {
    // 直接调用 API，拦截器会自动处理令牌
    const response = await apiClient.debouncedGet('/wallet-bot/me')
    userInfo.value = response.data.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadBalance() {
  try {
    const response = await apiClient.debouncedGet('/wallet-bot/me/balance')
    balance.value = response.data.data.balance.toFixed(2)
  } catch (error) {
    console.error('获取余额失败:', error)
  }
}


onMounted(async () => {
  // try to read Telegram initDataUnsafe for user photo (no validation here)

  try {
    const urlParams = new URLSearchParams(window.location.search)
    let userUUid = localStorage.getItem('user_uuid')
    console.log('📋 URL 中的 user_uuid:', userUUid)

    if(!userUUid){
        // 检查是否已有存储的 UUID
        userUUid = urlParams.get('user_uuid')
    }

    if(!userUUid){
        console.warn('⚠️ 未找到 user_uuid')
        errorMessage.value = '未找到用户标识'
        return
    } else {
        // 存储 UUID 以备后用
        localStorage.setItem('user_uuid', userUUid);
    }

    // 1. 获取用户信息
    await loadUserInfo()
    if (userInfo.value) {
      userId.value = userInfo.value.uuid || '用户ID'
      userName.value = userInfo.value.name || '用户名称'
      address.value = userInfo.value.account?.address || 'TNPqLpM1Y3wGjqM4K5n6b7c8d9e0f1g2h3i4j5k'
    }

    //2. 获取余额信息
    await loadBalance()

  } catch (e) {
    // ignore
    console.warn('获取Telegram用户信息失败:', e);
  }
})
</script>

<style scoped>
.home { min-height:100vh; padding:20px; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f5f7fa }
.top { padding:6px 12px }
.top .content { display:flex; justify-content:flex-start; align-items:center; margin:0 auto; width:100%; box-sizing:border-box; padding:0 12px }
  .top .content.header-row { gap:8px; position:relative; align-items:stretch }
.header-icons { position:absolute; top:12px; right:12px; display:flex; gap:8px; align-items:center }
.icons { display:flex; gap:8px }
  .logo { width:96px; display:flex; align-items:center; justify-content:center; background:transparent; color:#fff; border-radius:12px; font-weight:800; box-shadow: 0 6px 18px rgba(64,158,255,0.12); font-size:20px; align-self:stretch }
  .logo-svg { width:80px; height:80px; display:block }
.icons { display:flex; gap:8px }
/* .icon-button { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:10px; border:1px solid rgba(0,0,0,0.06); background:transparent; color:var(--tg-text); transition: transform .12s ease, box-shadow .12s ease, background .12s ease; padding:0 } */
.icon-button {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none; /* 移除边框 */
  background: transparent; /* 完全透明 */
  transition: transform .12s ease, opacity .12s ease;
  padding: 0;
}
.icon-button:hover { transform:translateY(-2px); box-shadow: 0 8px 20px rgba(31,45,61,0.06); background: rgba(0,0,0,0.04) }
.help-btn svg { color: var(--tg-accent); }
/* .help-btn { border-color: rgba(64,158,255,0.12); background: rgba(64,158,255,0.04) } */
.help-btn {
  /* 移除所有边框和背景 */
  border: none;
  background: transparent;
}
/* .support-btn { background: rgba(0,0,0,0.02) } */
.support-btn {
  background: transparent; /* 完全透明 */
  border: none;
}
.content { width:100%; max-width:720px; margin:18px auto 0; display:flex; flex-direction:column; gap:12px; padding:6px 12px; box-sizing:border-box }
  .content.header-row { background:#fff; padding:10px 12px; border-radius:12px; box-shadow: 0 12px 30px rgba(31,45,61,0.06); margin:10px auto; min-height:132px }
.user-card { margin-top:0; padding:14px; border-radius:12px; background:#fff; box-shadow: 0 12px 30px rgba(31,45,61,0.06) }
.user-id, .address { margin-bottom:8px }
/* .balance-row { display:flex; align-items:center; gap:8px } */
.balance-row { 
  display: flex; 
  align-items: center; 
  gap: 8px;
  border-top: 1px dashed #e0e0e0;
  padding-top: 16px;
  margin-top: 16px;
}
.balance-label { color:#666 }
.balance-value { font-size:20px; font-weight:600 }
.icon-eye { background:transparent; border:none; padding:6px; display:inline-flex; align-items:center; justify-content:center; color:var(--tg-text); border-radius:8px }
.icon-eye svg { display:block }
.avatar { width:48px; height:48px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#e6f3ff,#d9ecff); color:#0b6fb6; border-radius:12px; font-weight:700 }
.avatar-img { width:48px; height:48px; border-radius:50%; object-fit:cover }
.copy-btn { background:transparent; border:none; display:inline-flex; align-items:center; gap:6px; padding:6px; border-radius:8px; color:var(--tg-text); cursor:pointer }
.copy-icon { color:var(--tg-text); opacity:0.9 }
.copy-icon.success { color: #22c55e }
.copy-text { font-size:13px; color:var(--tg-text) }
@media (max-width:420px) {
  .copy-text { display:none }
}
.copy-user { background:transparent; border:none; display:inline-flex; align-items:center; gap:6px; padding:4px; border-radius:6px; color:var(--tg-text); cursor:pointer }
.copy-user .copy-text { font-size:12px }
.user-name { font-size:16px; margin-bottom:6px }
.bill-button { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:8px; background:transparent; border:none; color:var(--tg-text); cursor:pointer }
.bill-button:hover { background: rgba(0,0,0,0.04) }
.bill-icon { opacity:0.95 }
.bill-chev { margin-left:6px; color:var(--tg-text) }
.bill-text { font-size:14px }
.shortcuts { margin-top:6px; display:grid; grid-template-columns:repeat(4,1fr); gap:8px; background:#fff; padding:12px; border-radius:12px; box-shadow: 0 10px 24px rgba(31,45,61,0.04) }
.btn { padding:10px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.06); background:#fff }
.btn.primary { background:var(--tg-accent); color:#fff; border-color:var(--tg-accent) }
.btn.disabled { opacity:0.5 }
/* button icon spacing */
.btn svg { width:18px; height:18px; margin-right:8px; color:inherit }
.btn span { vertical-align:middle }


@media (max-width:720px) {
  .content { margin:12px }
  .logo { width:40px; height:40px }
  .shortcuts { grid-template-columns:repeat(2,1fr) }
}

/* Mobile-specific fine tuning */
@media (max-width:420px) {
  /* reduce outer padding so content can take full device width */
  .home { padding:0; width:100% }
  .content { margin:0; padding:0 12px; max-width:100% }
  .content.header-row { margin:0; padding:10px 12px; max-width:100% }
  /* defensive: prevent horizontal overflow and wrap long strings */
  .home, .content, .content.header-row { overflow-x: hidden }
  .address code, .user-id, .copy-text { word-break: break-word; white-space: normal }
  .user-card { padding:12px }
  .shortcuts { padding:10px; gap:6px }
  .btn { padding:12px; min-height:44px; font-size:14px }
  .avatar, .avatar-img { width:40px; height:40px }
  .logo { width:40px; height:40px }
  .icon-button { width:40px; height:40px }
  .bill-text { display:inline-block; font-size:13px }
  .balance-value { font-size:18px }
}

/* 安全提示区域 */
.security-tip {
  background: rgba(220, 38, 38, 0.05); /* 浅红色背景 */
  border: 1px solid rgba(220, 38, 38, 0.15);
  border-radius: 10px;
  padding: 12px 16px;
  margin-top: 12px;
  font-size: 10px;
  color: #dc2626; /* 红色文字 */
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.warning-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

.tip-text {
  flex: 1;
  line-height: 1.4;
}

.tip-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  text-decoration: none;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.tip-link:hover {
  background-color: rgba(220, 38, 38, 0.1);
}

.link-arrow {
  opacity: 0.8;
}

/* 移动端适配 */
@media (max-width: 420px) {
  .security-tip {
    padding: 10px 12px;
    margin-top: 10px;
  }
  
  .tip-content {
    gap: 6px;
  }
}

</style>
