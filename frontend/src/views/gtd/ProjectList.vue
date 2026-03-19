<template>
  <div class="project-page">
    <h2>项目清单</h2>
    <p class="subtitle">双击画布添加子步骤，点击节点编辑/删除</p>

    <!-- 项目列表 + 思维导图 -->
    <div class="project-container">
      <!-- 左侧项目列表 -->
      <div class="project-sidebar">
        <div class="sidebar-header">
          <el-input
            v-model="newProjectTitle"
            placeholder="新建项目..."
            @keydown.enter="handleAddProject"
          >
            <template #append>
              <el-button :icon="Plus" @click="handleAddProject" />
            </template>
          </el-input>
        </div>
        <el-scrollbar class="project-scroll">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-item"
            :class="{ active: selectedProject?.id === project.id }"
            @click="selectProject(project)"
          >
            <el-icon><Folder /></el-icon>
            <span class="project-title">{{ project.title }}</span>
            <el-dropdown @command="handleCommand($event, project)" @click.stop>
              <el-button size="small" text @click.stop>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-empty v-if="!projects.length" description="暂无项目" :image-size="60" />
        </el-scrollbar>
      </div>

      <!-- 右侧思维导图 -->
      <div class="mindmap-container">
        <div v-if="selectedProject" class="mindmap-wrapper">
          <VueFlow
            ref="vueFlowRef"
            :nodes="nodes"
            :edges="edges"
            :default-viewport="{ x: 0, y: 300, zoom: 0.8 }"
            :min-zoom="0.2"
            :max-zoom="2"
            fit-view-on-init
            class="mindmap-flow"
            @pane-click="onPaneClick"
            @node-click="onNodeClick"
          >
            <Background pattern-color="#aaa" :gap="20" />
            <Controls />
          </VueFlow>
        </div>
        <el-empty v-else description="选择一个项目开始分解" :image-size="80" />
      </div>
    </div>

    <!-- 添加/编辑子节点对话框 -->
    <el-dialog v-model="dialogVisible" :title="editingNode ? '编辑子步骤' : '添加子步骤'" width="400px">
      <el-input v-model="nodeTitle" placeholder="请输入步骤名称" @keydown.enter="confirmAction" />
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="editingNode" type="danger" @click="deleteNode">删除</el-button>
          <div class="footer-right">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAction">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { More, Plus, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { Node, Edge } from '@vue-flow/core'

const taskStore = useTaskStore()
const projects = computed(() => taskStore.tasksByStatus[TaskStatus.PROJECT] || [])

useVueFlow()

// 新建项目
const newProjectTitle = ref('')

const handleAddProject = async () => {
  if (!newProjectTitle.value.trim()) return
  await taskStore.createTask({
    title: newProjectTitle.value.trim(),
    status: TaskStatus.PROJECT,
    isProject: true
  })
  newProjectTitle.value = ''
  ElMessage.success('项目已创建')
}

// 选择的项目
const selectedProject = ref<Task | null>(null)
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// 所有子任务缓存
const allSubTasks = ref<Task[]>([])

const selectProject = async (project: Task) => {
  selectedProject.value = project

  // 获取所有项目子任务
  allSubTasks.value = await taskStore.fetchTasksByStatus(TaskStatus.PROJECT)

  // 筛选出当前项目的子任务
  const subTasks = allSubTasks.value.filter(t => t.parentId === project.id)

  buildMindMap(project, subTasks)
}

// 构建思维导图 - 左对齐布局
const buildMindMap = (project: Task, subTasks: Task[]) => {
  const newNodes: Node[] = []
  const newEdges: Edge[] = []

  // 根节点放在右侧
  const rootNode: Node = {
    id: `root-${project.id}`,
    position: { x: 600, y: 300 },
    data: { label: project.title, isRoot: true },
    style: {
      background: 'linear-gradient(135deg, #008080 0%, #006666 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      padding: '18px 30px',
      fontSize: '16px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(0,128,128,0.3)'
    }
  }
  newNodes.push(rootNode)

  // 子节点放在左侧，垂直排列
  const levelX = 100
  const startY = 100
  const gapY = 120

  subTasks.forEach((task, index) => {
    const nodeId = `task-${task.id}`
    const y = startY + index * gapY

    const node: Node = {
      id: nodeId,
      position: { x: levelX, y },
      data: { label: task.title, taskId: task.id },
      style: {
        background: '#fff',
        border: '2px solid #008080',
        borderRadius: '20px',
        padding: '12px 24px',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }

    newNodes.push(node)

    // 贝塞尔曲线连接线
    newEdges.push({
      id: `edge-${project.id}-${task.id}`,
      source: `root-${project.id}`,
      target: nodeId,
      type: 'smoothstep',
      style: { stroke: '#008080', strokeWidth: 2 },
      animated: false
    })
  })

  nodes.value = newNodes
  edges.value = newEdges
}

// 点击画布 - 添加子步骤
const onPaneClick = (event: any) => {
  if (!selectedProject.value) return

  // 获取点击位置
  const position = {
    x: event.event.clientX - 250,
    y: event.event.clientY - 100
  }

  // 显示添加对话框
  editingNode.value = null
  nodeTitle.value = ''
  nodePosition.value = position
  dialogVisible.value = true
}

// 点击节点 - 编辑
const onNodeClick = (event: any) => {
  const node = event.node
  if (node.id.startsWith('root-')) return // 不能编辑根节点

  editingNode.value = node
  nodeTitle.value = node.data.label
  nodePosition.value = null
  dialogVisible.value = true
}

// 对话框状态
const dialogVisible = ref(false)
const editingNode = ref<Node | null>(null)
const nodeTitle = ref('')
const nodePosition = ref<{ x: number; y: number } | null>(null)

// 确认添加/编辑
const confirmAction = async () => {
  if (!nodeTitle.value.trim() || !selectedProject.value) return

  if (editingNode.value) {
    // 编辑现有节点
    const taskId = editingNode.value.data.taskId
    if (taskId) {
      const task = allSubTasks.value.find(t => t.id === taskId)
      if (task) {
        await taskStore.updateTask(taskId, { ...task, title: nodeTitle.value.trim() })
      }
    }
  } else {
    // 添加新节点
    await taskStore.createTask({
      title: nodeTitle.value.trim(),
      status: TaskStatus.PROJECT,
      parentId: selectedProject.value.id
    })
  }

  dialogVisible.value = false

  // 刷新
  const subTasks = allSubTasks.value.filter(t => t.parentId === selectedProject.value?.id)
  buildMindMap(selectedProject.value, subTasks)
}

// 删除节点
const deleteNode = async () => {
  if (!editingNode.value) return

  const taskId = editingNode.value.data.taskId
  if (taskId) {
    await ElMessageBox.confirm('确定要删除这个子步骤吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await taskStore.deleteTask(taskId)
    dialogVisible.value = false

    // 刷新
    if (!selectedProject.value) return
    const subTasks = allSubTasks.value.filter(t => t.parentId === selectedProject.value?.id)
    buildMindMap(selectedProject.value, subTasks)

    ElMessage.success('已删除')
  }
}

// 处理菜单命令
const handleCommand = async (command: string, project: Task) => {
  if (command === 'delete') {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await taskStore.deleteTask(project.id!)
    if (selectedProject.value?.id === project.id) {
      selectedProject.value = null
    }
    ElMessage.success('已删除')
  }
}

onMounted(() => {
  taskStore.fetchAllTasks()
})
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
</style>

<style scoped>
.project-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.subtitle {
  color: #666;
  margin-bottom: 16px;
}

.project-container {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

.project-sidebar {
  width: 280px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.project-scroll {
  flex: 1;
  padding: 8px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.project-item:hover {
  background: #f5f5f5;
}

.project-item.active {
  background: #e6f7f7;
  color: #008080;
}

.project-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mindmap-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mindmap-wrapper {
  width: 100%;
  height: 100%;
}

.mindmap-flow {
  height: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}

.footer-right {
  display: flex;
  gap: 8px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .project-container {
    flex-direction: column;
  }

  .project-sidebar {
    width: 100%;
    max-height: 200px;
  }
}
</style>
