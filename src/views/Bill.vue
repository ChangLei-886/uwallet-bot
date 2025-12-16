<template>
  <div class="bill-page">
    <!-- 第一行：交易类型筛选 -->
    <div class="filter-tabs">
      <button
        v-for="tab in typeTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeType === tab.value }"
        @click="activeType = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 第二行：下拉筛选（融合背景风格） -->
    <div class="dropdown-filters">
      <div 
        class="filter-option" 
        :class="{ 'has-value': hasAmountRange }"
        @click="showAmountModal = true"
      >
        <span class="filter-text">
          <span class="filter-label">金额范围</span>
          <span class="filter-value">
            {{ hasAmountRange ? formatAmountRange(amountRange) : '不限' }}
          </span>
        </span>
        <span class="dropdown-arrow">▼</span>
      </div>

      <div class="vertical-divider"></div>

      <div 
        class="filter-option" 
        @click="showDateModal = true"
      >
        <span class="filter-text">
          <span class="filter-label">时间</span>
          <span class="filter-value">
            {{ dateFilter === 'all' ? '全部' : selectedMonth }}
          </span>
        </span>
        <span class="dropdown-arrow">▼</span>
      </div>
    </div>

    <div 
      class="bill-list-container" 
      ref="scrollContainer"
      @scroll="handleScroll"
      @wheel="handleScroll"
      @touchmove="handleScroll"
    >
      <!-- 账单列表 -->
      <div class="bill-list">
        <div v-if="loading && currentPage === 1" class="loading-state">
          <div class="loading-spinner"></div>
          <div>加载中...</div>
        </div>
        <div v-if="filteredBills.length === 0" class="empty-tip">
          暂无符合条件的账单
        </div>
        <div
          v-for="bill in filteredBills"
          :key="bill.id"
          class="bill-item"
          :class="bill.transaction_type"
        >
          <div class="bill-icon">{{ bill.transaction_type === 'recharge' ? '↑' : '↓' }}</div>
          <div class="bill-info">
            <div class="bill-title">{{ bill.transaction_type === 'recharge' ? '充值' : '提现' }}</div>
            <div class="bill-subtitle">
              <span class="bill-time">{{ formatDate(bill.trading_time) }}</span>
            </div>
            <div class="bill-subtitle">
              <span 
                class="bill-txid" 
                @click="toggleTxid(bill.id)"
                :title="bill.txid"
                :data-expanded="expandedStates[bill.id]"
              >
                {{ formatTxid(bill.txid, bill.id) }}
              </span>

              <button class="copy-btn" @click.stop="copyTxid(bill.txid, bill.id)" :title="txidCopiedStates[bill.id] ? '已复制' : '复制TXID'" aria-live="polite">
                  <svg v-if="!txidCopiedStates[bill.id]" class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          <div class="bill-amount">
            {{ bill.transaction_type === 'recharge' ? '+' : '-' }}¥{{ formatNumber(bill.amount) }}
          </div>
        </div>

        <!-- 加载更多指示器 -->
        <div v-if="loadingMore" class="loading-more">
          <div class="loading-spinner small"></div>
          <span>加载中...</span>
        </div>
        
        <!-- 显示"没有更多"提示 -->
        <div v-if="!hasMore && filteredBills.length > 0" class="no-more">
          没有更多记录了
        </div>
        
        <!-- 分页加载更多 -->
        <div v-if="filteredBills.length < totalCount" class="load-more">
          <button class="load-more-btn" @click="loadMore" :disabled="loading">
            {{ loading ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 金额范围筛选浮层 -->
    <div v-if="showAmountModal" class="bottom-modal-overlay" @click.self="showAmountModal = false">
      <div class="bottom-modal-content">
        <div class="modal-header">
          <div class="modal-drag-bar"></div>
          <h3>金额范围</h3>
          <button class="modal-close" @click="showAmountModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="range-inputs">
            <div class="input-group">
              <label for="minAmount">最小金额</label>
              <input
                id="minAmount"
                v-model.number="tempAmountRange.min"
                type="number"
                placeholder="0"
                class="amount-input"
              />
            </div>
            <div class="range-separator">至</div>
            <div class="input-group">
              <label for="maxAmount">最大金额</label>
              <input
                id="maxAmount"
                v-model.number="tempAmountRange.max"
                type="number"
                placeholder="不限"
                class="amount-input"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="resetAmountRange">清空</button>
          <button class="btn btn-primary" @click="applyAmountRange">确定</button>
        </div>
      </div>
    </div>

    <!-- 时间选择浮层 -->
    <div v-if="showDateModal" class="bottom-modal-overlay" @click.self="showDateModal = false">
      <div class="bottom-modal-content">
        <div class="modal-header">
          <div class="modal-drag-bar"></div>
          <h3>选择时间</h3>
          <button class="modal-close" @click="showDateModal = false">×</button>
        </div>
        <div class="modal-body date-modal">
          <!-- 全部时间选项 -->
          <div class="quick-options">
            <button
              class="quick-option"
              :class="{ active: dateFilter === 'all' }"
              @click="selectAllTime"
            >
              全部时间
            </button>
          </div>
          
          <!-- 月份选择器 -->
          <div class="month-selector">
            <button class="nav-btn" @click="prevYear">‹‹</button>
            <div class="current-year">{{ currentYear }}年</div>
            <button class="nav-btn" @click="nextYear">››</button>
          </div>
          <div class="month-grid">
            <button
              v-for="month in 12"
              :key="month"
              class="month-option"
              :class="{
                active: isSelectedMonth(currentYear, month),
                'current-month': isCurrentMonth(currentYear, month)
              }"
              @click="selectSpecificMonth(month)"
            >
              {{ month }}月
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="resetDate">重置</button>
          <button class="btn btn-primary" @click="applyDate">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, onUnmounted, nextTick} from 'vue'
import apiClient from '../api/client'

// 第一行筛选：交易类型
const typeTabs = [
  { label: '全部', value: 'all' },
  { label: '充值', value: 'recharge' },
  { label: '提现', value: 'withdraw' }
]
const activeType = ref('all')

// 第二行筛选：金额范围
const amountRange = reactive({ min: null, max: null })
const tempAmountRange = reactive({ min: null, max: null })
const showAmountModal = ref(false)

// 第二行筛选：时间选择
const selectedDate = ref(new Date())
const showDateModal = ref(false)
const currentYear = ref(new Date().getFullYear())
const dateFilter = ref('all') // 'all' 表示全部时间，'specific' 表示具体月份

const expandedStates = ref({}) // 存储每个账单的展开状态
const formatTxid = (txid, billId) => {
  if (!txid) return ''
  
  if (expandedStates.value[billId]){  
    return txid 
  } else {
    return `${txid.slice(0,10)}...${txid.slice(-10)}`
  }
}

function toggleTxid(billId) {
  // 切换当前账单的展开状态
  expandedStates.value[billId] = !expandedStates.value[billId]
}

const txidCopiedStates = ref({}) // 每个账单的复制状态
let txidCopyTimer = null // 用于清除复制状态

// 复制 TXID 函数（修复版）
async function copyTxid(txid, billId) {
  if (!txid) return
  
  try {
    await navigator.clipboard.writeText(txid)
    
    // 清除之前的定时器
    if (txidCopyTimer) {
      clearTimeout(txidCopyTimer)
      txidCopyTimer = null
    }
    
    // 先清除所有状态
    Object.keys(txidCopiedStates.value).forEach(key => {
      txidCopiedStates.value[key] = false
    })
    
    // 只设置当前行的复制状态
    txidCopiedStates.value[billId] = true
    
    // 使用统一的 toast 提示
    window.dispatchEvent(new CustomEvent('app:toast', { 
      detail: '已复制' 
    }))
    
    // 2秒后清除当前行的复制状态
    txidCopyTimer = setTimeout(() => {
      txidCopiedStates.value[billId] = false
    }, 2000)
    
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const loading = ref(false)
const loadingMore = ref(false) // 专门用于加载更多的状态
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const filteredBills = ref([])
const scrollContainer = ref(null)
const hasMore = computed(() => {
  return filteredBills.value.length < totalCount.value
})

// 监听滚动事件
const handleScroll = () => {
  if (!scrollContainer.value || loadingMore.value || !hasMore.value) return
  
  const container = scrollContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight
  
  // 滚动到底部时触发加载更多（距离底部100px时触发）
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMore()
  }
}


// 修改后的 loadMore 函数
async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  
  loadingMore.value = true
  try {
    currentPage.value++
    const params = buildRequestParams()
    const response = await apiClient.throttledGet('/wallet-bot/me/transactions/paginated', { params })
    
    // 根据实际API响应结构调整
    const newItems = response.data?.data?.items || 
                     response.data?.items || 
                     response.data?.data || 
                     []
    
    // 追加数据
    filteredBills.value = [...filteredBills.value, ...newItems]
    
    // 更新总数
    if (response.data?.data?.num !== undefined) {
      totalCount.value = response.data.data.num
    } else if (response.data?.total !== undefined) {
      totalCount.value = response.data.total
    } else if (response.data?.total_count !== undefined) {
      totalCount.value = response.data.total_count
    }
    
  } catch (error) {
    console.error('加载更多失败:', error)
    currentPage.value-- // 失败时回退页码
    // 显示错误提示
    window.dispatchEvent(new CustomEvent('app:toast', { 
      detail: '加载失败，请重试' 
    }))
  } finally {
    loadingMore.value = false
  }
}


// 计算属性：检查是否有设置金额范围
const hasAmountRange = computed(() => {
  return amountRange.min !== null || amountRange.max !== null
})

// 计算属性：格式化显示的月份
const selectedMonth = computed(() => {
  if (dateFilter.value === 'all') return ''
  const d = selectedDate.value
  return `${d.getFullYear()}.${d.getMonth() + 1}`
})

// 计算属性：根据筛选条件过滤账单
function buildRequestParams() {
  const params = {
    page: currentPage.value,
    page_size: pageSize.value
  }
  
  // 交易类型
  if (activeType.value !== 'all') {
    params.transaction_type = activeType.value
  }
  
  // 金额范围
  if (amountRange.min !== null) {
    params.start_amount = amountRange.min
  }
  if (amountRange.max !== null) {
    params.end_amount = amountRange.max
  }
  
  // 时间筛选
  if (dateFilter.value === 'specific' && selectedDate.value) {
    const date = selectedDate.value
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    params.trading_month = `${year}-${month.toString().padStart(2, '0')}`
  }
  
  return params
}

// 修改 fetchBills 函数（重置数据）
async function fetchBills() {
  loading.value = true
  try {
    currentPage.value = 1
    const params = buildRequestParams()
    const response = await apiClient.throttledGet('/wallet-bot/me/transactions/paginated', { params })
    
    // 根据实际API响应结构调整
    const items = response.data?.data?.items || 
                  response.data?.items || 
                  response.data?.data || 
                  []
    
    filteredBills.value = items
    
    // 更新总数
    if (response.data?.data?.num !== undefined) {
      totalCount.value = response.data.data.num
    } else if (response.data?.total !== undefined) {
      totalCount.value = response.data.total
    } else if (response.data?.total_count !== undefined) {
      totalCount.value = response.data.total_count
    }
    
  } catch (error) {
    console.error('获取账单失败:', error)
    // 显示错误提示
    window.dispatchEvent(new CustomEvent('app:toast', { 
      detail: '获取账单失败' 
    }))
  } finally {
    loading.value = false
  }
}

// 修改：处理类型变更
function handleTypeChange(type) {
  activeType.value = type
  currentPage.value = 1 // 重置页码
  fetchBills()
}

// 修改：应用金额范围
async function applyAmountRange() {
  amountRange.min = tempAmountRange.min
  amountRange.max = tempAmountRange.max
  showAmountModal.value = false
  await fetchBills()
}

// 修改：清空金额范围
async function resetAmountRange() {
  tempAmountRange.min = null
  tempAmountRange.max = null
  amountRange.min = null
  amountRange.max = null
  await fetchBills()
}

// 修改：应用日期筛选
async function applyDate() {
  showDateModal.value = false
  await fetchBills()
}

// 修改：重置日期
async function resetDate() {
  dateFilter.value = 'all'
  selectedDate.value = new Date()
  currentYear.value = new Date().getFullYear()
  await fetchBills()
}

// 监听筛选条件变化，自动刷新
watch([activeType, () => amountRange.min, () => amountRange.max, dateFilter], () => {
  // 使用防抖避免频繁请求
  clearTimeout(window.fetchTimer)
  window.fetchTimer = setTimeout(() => {
    fetchBills()
  }, 300)
}, { deep: true })

// 修改初始化
onMounted(async () => {
  const now = new Date()
  currentYear.value = now.getFullYear()
  await fetchBills() // 初始加载数据

  // 确保容器高度足够
  // nextTick(() => {
  //   if (scrollContainer.value) {
  //     // 确保容器有足够的高度才能滚动
  //     const setContainerHeight = () => {
  //       if (scrollContainer.value) {
  //         const windowHeight = window.innerHeight
  //         const containerRect = scrollContainer.value.getBoundingClientRect()
  //         const containerTop = containerRect.top
  //         scrollContainer.value.style.height = `${windowHeight - containerTop}px`
  //       }
  //     }
      
  //     setContainerHeight()
  //     window.addEventListener('resize', setContainerHeight)
  //   }
  // })
  nextTick(() => {
    // 只检查容器是否存在，不修改其样式
    if (scrollContainer.value) {
      console.log('滚动容器已挂载，高度:', scrollContainer.value.clientHeight)
    }
  })
})

// 组件卸载时清理
onUnmounted(() => {
  if (window.fetchTimer) {
    clearTimeout(window.fetchTimer)
  }
   // 删除之前可能添加的resize监听
  window.removeEventListener('resize', setContainerHeight)
})

// 方法：格式化金额范围显示
function formatAmountRange(range) {
  const { min, max } = range
  if (min !== null && max !== null) {
    if (min === max) return `¥${formatNumber(min)}`
    return `${formatNumber(min)}-${formatNumber(max)}`
  } else if (min !== null) {
    return `>${formatNumber(min)}`
  } else if (max !== null) {
    return `<${formatNumber(max)}`
  }
  return ''
}

// 方法：数字格式化（更完善的版本）
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return ''
  }
  
  // 转换为数字类型
  const number = Number(num)
  
  // 检查是否是整数
  const isInteger = number % 1 === 0
  
  if (isInteger) {
    // 整数：直接格式化为千分位
    return number.toLocaleString()
  } else {
    // 小数：保留2位小数，并格式化为千分位
    return number.toLocaleString('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }
}

// 方法：格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const time = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
  return `${year}.${month}.${day} ${time}`
}

// 方法：时间选择操作
function selectAllTime() {
  dateFilter.value = 'all'
}

function selectSpecificMonth(month) {
  dateFilter.value = 'specific'
  selectedDate.value = new Date(currentYear.value, month - 1, 1)
}

function isSelectedMonth(year, month) {
  if (dateFilter.value !== 'specific') return false
  const selected = selectedDate.value
  return selected.getFullYear() === year && selected.getMonth() + 1 === month
}

function isCurrentMonth(year, month) {
  const now = new Date()
  return now.getFullYear() === year && now.getMonth() + 1 === month
}

function prevYear() {
  currentYear.value--
}

function nextYear() {
  currentYear.value++
}
</script>

<style scoped>
/* 基础布局 */
.bill-page {
  max-width: 500px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
  font-size: 16px;
}

/* 第一行：类型筛选 */
.filter-tabs {
  display: flex;
  background: white;
  padding: 0 16px;
  position: relative;
}

.tab-item {
  flex: 1;
  padding: 16px 0;
  border: none;
  background: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-item.active {
  color: #0088cc;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #0088cc;
  border-radius: 1px;
}

/* 分割线 */
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 16px;
}

/* 第二行：下拉筛选（融合背景风格） */
.dropdown-filters {
  display: flex;
  align-items: center;
  background: white;
  padding: 14px 16px;
  position: relative;
}

.dropdown-filters::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: #f0f0f0;
}

.filter-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
  border-radius: 6px;
}

.filter-option:active {
  background-color: rgba(0, 0, 0, 0.02);
}

.filter-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 14px;
  color: #666;
}

.filter-value {
  font-size: 15px;
  color: #333;
  font-weight: normal;
  margin-top: 2px;
}

.filter-option.has-value .filter-value {
  color: #0088cc;
  font-weight: 500;
}

.dropdown-arrow {
  color: #ccc;
  font-size: 12px;
  transform: scaleY(0.8);
  margin-left: 8px;
  opacity: 0.7;
}

/* 垂直分割线 */
.vertical-divider {
  width: 1px;
  height: 24px;
  background: #f0f0f0;
  margin: 0 16px;
}

/* 账单列表 */
.bill-list {
  padding: 16px;
  background: #f8f9fa;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 15px;
  background: white;
  border-radius: 8px;
}

.bill-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.bill-icon {
  width: 5px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  flex-shrink: 0;
}

.bill-item.deposit .bill-icon {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.bill-item.withdraw .bill-icon {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.bill-info {
  flex: 1;
  min-width: 0;
}

.bill-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bill-subtitle {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #999;
  word-break: break-all;      /* 强制所有字符换行 */
  word-wrap: break-word;     /* 兼容性 */
  overflow-wrap: break-word; /* 现代标准 */
  line-height: 1.4;          /* 增加行高提升可读性 */
}

.bill-time {
  margin-right: 8px;
  white-space: nowrap; /* 时间保持单行 */
  flex-shrink: 0;      /* 防止时间被压缩 */
}

.bill-txid {
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  /* 确保 txid 文本可以换行 */
  white-space: normal !important;
  word-break: break-all;
  max-width: 100%;           /* 防止超出容器 */
}

.bill-txid:hover {
  text-decoration: underline;
}

.bill-amount {
  font-size: 17px;
  font-weight: 600;
  margin-left: 8px;
  flex-shrink: 0;
}

.bill-item.deposit .bill-amount {
  color: #4CAF50;
}

.bill-item.withdraw .bill-amount {
  color: #f44336;
}

/* 模态框样式 */
.bottom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.bottom-modal-content {
  background: white;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 500px;
  transform: translateY(100%);
  animation: slideUp 0.3s ease forwards;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.modal-drag-bar {
  width: 40px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin-bottom: 12px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  width: 100%;
  text-align: center;
}

.modal-close {
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24px 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

/* 金额范围模态框 */
.range-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.amount-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.amount-input:focus {
  outline: none;
  border-color: #0088cc;
}

.range-separator {
  color: #666;
  font-size: 16px;
  padding-top: 24px;
}

/* 时间选择模态框 */
.date-modal {
  text-align: center;
}

/* 快速选项样式 */
.quick-options {
  margin-bottom: 20px;
}

.quick-option {
  width: 100%;
  padding: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.quick-option:hover {
  border-color: #0088cc;
}

.quick-option.active {
  background: #0088cc;
  color: white;
  border-color: #0088cc;
}

/* 月份选择器 */
.month-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 20px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
}

.current-year {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.month-option {
  padding: 12px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.month-option:hover {
  border-color: #0088cc;
}

.month-option.active {
  background: #0088cc;
  color: white;
  border-color: #0088cc;
}

.month-option.current-month {
  border-color: #0088cc;
  color: #0088cc;
}

/* 按钮样式 */
.btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-primary {
  background: #0088cc;
  color: white;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0088cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 新增：加载更多按钮 */
.load-more {
  text-align: center;
  padding: 20px;
}

.load-more-btn {
  padding: 12px 30px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #ccc;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 修改空状态样式 */
.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 15px;
  background: white;
  border-radius: 8px;
}

/* 复制按钮 hover 效果（与 home.vue 保持一致） */
.copy-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 复制成功时的图标颜色 */
.copy-btn svg[stroke="currentColor"] {
  transition: color 0.2s;
}

/* TXID 文本样式保持原样 */
.bill-txid {
  word-break: break-all;
  overflow-wrap: anywhere;
  transition: all 0.2s;
}

/* 展开状态的 TXID */
.bill-txid.expanded {
  white-space: pre-wrap;
  background: #f8f9fa;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 2px;
  display: block;
  word-spacing: -0.5px;
  letter-spacing: 0.2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* 移动端适配：小屏隐藏复制文字 */
@media (max-width: 420px) {
  .copy-text {
    display: none;
  }
  
  .copy-btn {
    padding: 4px;
  }
}

/* 响应式调整 */
@media (max-width: 375px) {
  .filter-tabs {
    padding: 0 12px;
  }
  
  .tab-item {
    font-size: 15px;
    padding: 14px 0;
  }
  
  .dropdown-filters {
    padding: 12px;
  }
  
  .filter-label {
    font-size: 13px;
  }
  
  .filter-value {
    font-size: 14px;
  }
  
  .vertical-divider {
    margin: 0 12px;
  }
  
  .bill-list {
    padding: 12px;
  }
  
  .bill-item {
    padding: 14px;
  }
}

.copy-btn { background:transparent; border:none; display:inline-flex; align-items:center; gap:6px; padding:6px; border-radius:8px; color:var(--tg-text); cursor:pointer }
.copy-icon { color:var(--tg-text); opacity:0.9 }
.copy-icon.success { color: #22c55e }
.copy-text { font-size:13px; color:var(--tg-text) }
@media (max-width:420px) {
  .copy-text { display:none }
}

<style scoped>
/* 添加滚动容器样式 */
.bill-list-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f8f9fa;
}

/* 加载更多指示器 */
.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #0088cc;
  margin-bottom: 8px;
}

/* 没有更多提示 */
.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

/* 确保账单列表容器有正确的布局 */
.bill-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 500px;
  margin: 0 auto;
  background: #f8f9fa;
}

.filter-tabs,
.dropdown-filters {
  flex-shrink: 0;
}

.bill-list-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
  position: relative; /* 确保定位正确 */
}

/* 移动端优化 */
@media (max-width: 375px) {
  .bill-page {
    font-size: 14px;
  }
  
  .bill-list-container {
    padding: 0 12px;
  }
}

/* 加载状态优化 */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state .loading-spinner {
  margin: 0 auto 10px;
}
</style>