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

    <!-- 账单列表 -->
    <div class="bill-list">
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
        </div>
        <div class="bill-amount">
          {{ bill.transaction_type === 'recharge' ? '+' : '-' }}¥{{ formatNumber(bill.amount) }}
        </div>
      </div>

      <!-- 分页加载更多 -->
      <div v-if="filteredBills.length < totalCount" class="load-more">
        <button class="load-more-btn" @click="loadMore" :disabled="loading">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
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
import { ref, computed, reactive, onMounted, watch } from 'vue'
import axios from 'axios'
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

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const filteredBills = ref([]) // 从计算属性改为响应式数组


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

// 新增：获取账单数据
async function fetchBills() {
  loading.value = true
  try {
    const params = buildRequestParams()
    const response = await apiClient.debouncedGet('/wallet-bot/me/transactions/paginated', { params })
    
    // 假设接口返回结构为 { data: [], total: 100, page: 1, page_size: 20 }
    filteredBills.value = response.data.data.items || []
    totalCount.value = response.data.data.num || 0
    
    // 如果接口返回的字段名不同，可能需要适配
    // 例如: filteredBills.value = response.data.transactions
    // totalCount.value = response.data.total_count
  } catch (error) {
    console.error('获取账单失败:', error)
    // 可以显示错误提示
  } finally {
    loading.value = false
  }
}

// 新增：加载更多
async function loadMore() {
  currentPage.value++
  loading.value = true
  try {
    const params = buildRequestParams()
    const response = await axios.get('/wallet-bot/me/transactions/paginated', { params })
    
    // 追加数据
    const newBills = response.data.data || response.data
    filteredBills.value = [...filteredBills.value, ...newBills]
    
  } catch (error) {
    console.error('加载更多失败:', error)
    currentPage.value-- // 失败时回退页码
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
  currentPage.value = 1
  await fetchBills()
}

// 修改：清空金额范围
async function resetAmountRange() {
  tempAmountRange.min = null
  tempAmountRange.max = null
  amountRange.min = null
  amountRange.max = null
  currentPage.value = 1
  await fetchBills()
}

// 修改：应用日期筛选
async function applyDate() {
  showDateModal.value = false
  currentPage.value = 1
  await fetchBills()
}

// 修改：重置日期
async function resetDate() {
  dateFilter.value = 'all'
  selectedDate.value = new Date()
  currentYear.value = new Date().getFullYear()
  currentPage.value = 1
  await fetchBills()
}

// 新增：监听筛选条件变化，自动刷新（可选）
watch([activeType, () => amountRange.min, () => amountRange.max, dateFilter], () => {

  // 可以添加防抖，避免频繁请求
  fetchBills()
}, { deep: true })

// 修改初始化
onMounted(async () => {
  const now = new Date()
  currentYear.value = now.getFullYear()
  await fetchBills() // 初始加载数据
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
  width: 40px;
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
}

.bill-time {
  margin-right: 4px;
}

.bill-category {
  opacity: 0.8;
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

<style scoped>
/* 新增：加载状态样式 */
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
</style>