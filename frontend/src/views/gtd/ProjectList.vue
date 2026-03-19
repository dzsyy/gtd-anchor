<template>
  <div class="project-page">
    <h2>项目清单</h2>
    <p class="subtitle">点击项目查看思维导图，分解你的任务</p>

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
            :nodes="nodes"
            :edges="edges"
            :default-viewport="{ zoom: 0.8 }"
            :min-zoom="0.2"
            :max-zoom="2"
            fit-view-on-init
            class="mindmap-flow"
          >
            <Background pattern-color="#aaa" :gap="16" />
            <Controls />
          </VueFlow>

          <div class="mindmap-toolbar">
            <el-button type="primary" @click="addChildNode">
              <el-icon><Plus /></el-icon>
              添加子步骤
            </el-button>
            <el-button @click="fitView">适应画布</el-button>
          </div>
        </div>
        <el-empty v-else description="选择一个项目开始分解" :image-size="80" />
      </div>
    </div>

    <!-- 添加子节点对话框 -->
    <el-dialog v-model="dialogVisible" title="添加子步骤" width="400px">
      <el-input v-model="newChildTitle" placeholder="请输入子步骤名称" @keydown.enter="confirmAddChild" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddChild">确定</el-button>
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

const { fitView } = useVueFlow()

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

// 构建思维导图
const buildMindMap = (project: Task, subTasks: Task[]) => {
  // 根节点
  const rootNode: Node = {
    id: `root-${project.id}`,
    position: { x: 250, y: 300 },
    data: { label: project.title, isRoot: true },
    style: {
      background: '#008080',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '15px 25px',
      fontSize: '16px',
      fontWeight: 'bold'
    }
  }

  const newNodes: Node[] = [rootNode]
  const newEdges: Edge[] = []

  // 子节点
  const levelWidth = 300
  subTasks.forEach((task, index) => {
    const nodeId = `task-${task.id}`
    const row = Math.floor(index / 3)
    const col = index % 3

    const node: Node = {
      id: nodeId,
      position: {
        x: 600 + col * levelWidth,
        y: 100 + row * 150
      },
      data: { label: task.title, taskId: task.id },
      style: {
        background: '#fff',
        border: '2px solid #008080',
        borderRadius: '20px',
        padding: '10px 20px',
        fontSize: '14px'
      }
    }

    newNodes.push(node)

    // 连接线
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

// 添加子节点
const dialogVisible = ref(false)
const newChildTitle = ref('')

const addChildNode = () => {
  if (!selectedProject.value) return
  dialogVisible.value = true
  newChildTitle.value = ''
}

const confirmAddChild = async () => {
  if (!newChildTitle.value.trim() || !selectedProject.value) return

  await taskStore.createTask({
    title: newChildTitle.value.trim(),
    status: TaskStatus.PROJECT,
    parentId: selectedProject.value.id
  })

  dialogVisible.value = false

  // 刷新思维导图
  const subTasks = allSubTasks.value.filter(t => t.parentId === selectedProject.value?.id)
  buildMindMap(selectedProject.value, subTasks)

  ElMessage.success('子步骤已添加')
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
/* 全局样式引入 Vue Flow */
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
  display: flex;
  flex-direction: column;
}

.mindmap-flow {
  flex: 1;
  min-height: 400px;
}

.mindmap-toolbar {
  padding: 12px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  justify-content: center;
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

  .mindmap-flow {
    min-height: 300px;
  }
}
</style>
