/**
 * Vercel KV ストレージヘルパー
 *
 * プロジェクトとアップロードファイルを Vercel KV に保存・取得します
 */

import { kv } from '@vercel/kv'
import type { Project, ProjectUpload } from '../../src/types'

// KV のキープレフィックス
const PROJECT_PREFIX = 'project:'
const USER_PROJECTS_PREFIX = 'user_projects:'
const SLUG_INDEX_PREFIX = 'slug:'
const UPLOAD_PREFIX = 'upload:'
const PROJECT_UPLOADS_PREFIX = 'project_uploads:'

/**
 * プロジェクトを保存
 */
export async function saveProject(project: Project): Promise<void> {
  const key = `${PROJECT_PREFIX}${project.id}`

  // プロジェクトを保存
  await kv.set(key, JSON.stringify(project))

  // ユーザーのプロジェクトリストに追加
  const userProjectsKey = `${USER_PROJECTS_PREFIX}${project.userId}`
  await kv.sadd(userProjectsKey, project.id)

  // スラッグインデックスを更新
  const slugKey = `${SLUG_INDEX_PREFIX}${project.userName}:${project.slug}`
  await kv.set(slugKey, project.id)
}

/**
 * プロジェクトを取得
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const key = `${PROJECT_PREFIX}${projectId}`
  const data = await kv.get(key)

  if (!data) return null

  return JSON.parse(data as string) as Project
}

/**
 * スラッグからプロジェクトを取得
 */
export async function getProjectBySlug(userName: string, slug: string): Promise<Project | null> {
  const slugKey = `${SLUG_INDEX_PREFIX}${userName}:${slug}`
  const projectId = await kv.get(slugKey)

  if (!projectId) return null

  return getProject(projectId as string)
}

/**
 * ユーザーのプロジェクト一覧を取得
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  const userProjectsKey = `${USER_PROJECTS_PREFIX}${userId}`
  const projectIds = await kv.smembers(userProjectsKey)

  if (!projectIds || projectIds.length === 0) return []

  const projects: Project[] = []
  for (const id of projectIds) {
    const project = await getProject(id as string)
    if (project) projects.push(project)
  }

  return projects.sort((a, b) => b.updatedAt - a.updatedAt)
}

/**
 * プロジェクトを削除
 */
export async function deleteProject(projectId: string): Promise<void> {
  const project = await getProject(projectId)
  if (!project) return

  // プロジェクトを削除
  const key = `${PROJECT_PREFIX}${projectId}`
  await kv.del(key)

  // ユーザーのプロジェクトリストから削除
  const userProjectsKey = `${USER_PROJECTS_PREFIX}${project.userId}`
  await kv.srem(userProjectsKey, projectId)

  // スラッグインデックスを削除
  const slugKey = `${SLUG_INDEX_PREFIX}${project.userName}:${project.slug}`
  await kv.del(slugKey)

  // アップロードされたファイルを削除
  const uploads = await getProjectUploads(projectId)
  for (const upload of uploads) {
    await deleteUpload(upload.id)
  }
}

/**
 * スラッグが利用可能かチェック
 */
export async function isSlugAvailable(userName: string, slug: string, excludeProjectId?: string): Promise<boolean> {
  const project = await getProjectBySlug(userName, slug)

  if (!project) return true
  if (excludeProjectId && project.id === excludeProjectId) return true

  return false
}

/**
 * 利用可能なスラッグを生成（衝突回避）
 */
export async function generateAvailableSlug(userName: string, baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (!(await isSlugAvailable(userName, slug))) {
    slug = `${baseSlug}-${counter}`
    counter++

    // 安全のため上限を設定
    if (counter > 100) {
      throw new Error('Failed to generate unique slug')
    }
  }

  return slug
}

/**
 * アップロードファイルを保存
 */
export async function saveUpload(upload: ProjectUpload): Promise<void> {
  const key = `${UPLOAD_PREFIX}${upload.id}`

  // アップロードを保存
  await kv.set(key, JSON.stringify(upload))

  // プロジェクトのアップロードリストに追加
  const projectUploadsKey = `${PROJECT_UPLOADS_PREFIX}${upload.projectId}`
  await kv.sadd(projectUploadsKey, upload.id)
}

/**
 * アップロードファイルを取得
 */
export async function getUpload(uploadId: string): Promise<ProjectUpload | null> {
  const key = `${UPLOAD_PREFIX}${uploadId}`
  const data = await kv.get(key)

  if (!data) return null

  return JSON.parse(data as string) as ProjectUpload
}

/**
 * プロジェクトのアップロード一覧を取得
 */
export async function getProjectUploads(projectId: string): Promise<ProjectUpload[]> {
  const projectUploadsKey = `${PROJECT_UPLOADS_PREFIX}${projectId}`
  const uploadIds = await kv.smembers(projectUploadsKey)

  if (!uploadIds || uploadIds.length === 0) return []

  const uploads: ProjectUpload[] = []
  for (const id of uploadIds) {
    const upload = await getUpload(id as string)
    if (upload) uploads.push(upload)
  }

  return uploads.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * アップロードファイルを削除
 */
export async function deleteUpload(uploadId: string): Promise<void> {
  const upload = await getUpload(uploadId)
  if (!upload) return

  // アップロードを削除
  const key = `${UPLOAD_PREFIX}${uploadId}`
  await kv.del(key)

  // プロジェクトのアップロードリストから削除
  const projectUploadsKey = `${PROJECT_UPLOADS_PREFIX}${upload.projectId}`
  await kv.srem(projectUploadsKey, uploadId)
}

/**
 * プロジェクトの合計アップロードサイズを取得
 */
export async function getProjectUploadSize(projectId: string): Promise<number> {
  const uploads = await getProjectUploads(projectId)
  return uploads.reduce((total, upload) => total + upload.size, 0)
}
