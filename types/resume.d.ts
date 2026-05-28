/**
 * 条目展示模式：all=全部展示, online=只在网页版展示, pdf=只在 PDF 版展示, never=隐藏
 */
export type DisplayMode = "all" | "online" | "pdf" | "never";

/**
 * 简历数据结构（参考 jsonresume.org 字段命名，并扩展了 workProject、openSourceProject 等自定义板块）
 */
export interface ResumeData {
  /**
   * JSON Schema 引用路径，用于让 IDE 提供字段补全和 hover 提示
   */
  $schema?: string;
  /**
   * 个人基础信息（姓名、联系方式、个人主页等）
   */
  basics: {
    /**
     * 中文姓名或常用展示名
     */
    name: string;
    /**
     * 头像图片 URL（可选，当前简历主页未直接使用）
     */
    picture?: string;
    /**
     * 职业标签，如 “前端开发工程师”
     */
    label?: string;
    /**
     * 求职状态，如 “在职, 2周内到岗”
     */
    status?: string;
    /**
     * 手机号码，会被渲染为可点击的 tel: 链接
     */
    phone?: string;
    /**
     * 工作年限的中文描述，如 “五年工作经验”
     */
    workingYears?: string;
    /**
     * 简介段落，仅在线版本展示
     */
    summary?: string;
    /**
     * 个人主页（仅元数据，渲染由 profiles.portfolio 控制）
     */
    website?: string;
    /**
     * 所在地，如 “中国·北京”
     */
    address?: string;
    /**
     * 在简历元数据中保留的用户名，未直接渲染
     */
    username?: string;
    /**
     * 邮箱地址，会被渲染为可点击的 mailto: 链接
     */
    email?: string;
    /**
     * 外部主页链接，目前支持 GitHub 与个人作品集
     */
    profiles?: {
      gitHub?: Profile;
      portfolio?: Profile1;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * 掌握的技能列表。每条建议格式：“分类: 描述”，会自动把冒号前的部分加粗
   */
  skillList?: string[];
  /**
   * 工作经历列表
   */
  work?: WorkExperience[];
  /**
   * 工作中的代表性项目
   */
  workProject?: WorkProject[];
  /**
   * 开源项目
   */
  openSourceProject?: OpenSourceProject[];
  /**
   * 其他/杂项小项目。Web 端在简历末尾以折叠区块展示，PDF 端整体隐藏
   */
  miscProject?: MiscProject[];
  /**
   * 教育经历
   */
  education?: Education[];
  /**
   * 出版物（暂未渲染，预留字段）
   */
  publications?: {
    [k: string]: unknown;
  }[];
  /**
   * 志愿者经历（暂未渲染，预留字段）
   */
  volunteer?: {
    [k: string]: unknown;
  }[];
  /**
   * 获奖经历（暂未渲染，预留字段）
   */
  awards?: {
    [k: string]: unknown;
  }[];
  /**
   * 语言能力（暂未渲染，预留字段）
   */
  languages?: {
    [k: string]: unknown;
  }[];
  /**
   * 兴趣爱好（暂未渲染，预留字段）
   */
  interests?: {
    [k: string]: unknown;
  }[];
  /**
   * 推荐人（暂未渲染，预留字段）
   */
  references?: {
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * GitHub 主页
 */
export interface Profile {
  /**
   * 平台名称，如 “GitHub” / “Portfolio”
   */
  network?: string;
  /**
   * 在该平台的用户名或展示名
   */
  username?: string;
  /**
   * 完整 URL，会作为图标链接的跳转目标
   */
  url: string;
  [k: string]: unknown;
}
/**
 * 个人作品集 / 博客主页
 */
export interface Profile1 {
  /**
   * 平台名称，如 “GitHub” / “Portfolio”
   */
  network?: string;
  /**
   * 在该平台的用户名或展示名
   */
  username?: string;
  /**
   * 完整 URL，会作为图标链接的跳转目标
   */
  url: string;
  [k: string]: unknown;
}
/**
 * 一段工作经历
 */
export interface WorkExperience {
  /**
   * 公司名称
   */
  company: string;
  mode?: DisplayMode;
  /**
   * 职位名称
   */
  position: string;
  /**
   * 公司官网，会作为公司名右侧的图标链接
   */
  website?: string;
  /**
   * 工作地点
   */
  location?: string;
  /**
   * 团队 / 业务线描述（暂未直接渲染，可用作元数据）
   */
  summary?: string;
  /**
   * 是否为当前职位（暂未直接渲染，可用作元数据）
   */
  isCurrentRole?: boolean;
  /**
   * 入职日期，格式建议 YYYY-MM-DD 或 YYYY-MM
   */
  startDate?: string;
  /**
   * 离职日期；缺省时显示为 “至今”
   */
  endDate?: string;
  /**
   * 工作亮点 / 主要职责，每条建议以中文分号或句号结尾。可用 “前缀: 内容” 让前缀加粗
   */
  highlights?: string[];
  [k: string]: unknown;
}
/**
 * 工作项目经验
 */
export interface WorkProject {
  /**
   * 项目名称，建议格式 “项目名 - 公司”
   */
  projectName: string;
  mode?: DisplayMode;
  /**
   * 在该项目中的角色（暂未直接渲染，可用作元数据）
   */
  role?: string;
  /**
   * 项目使用的技术栈，会渲染为 “技术栈” 行的标签
   */
  workSkill?: string[];
  /**
   * 项目分段描述
   */
  desc: WorkProjectSection[];
  /**
   * 项目起始日期（暂未直接渲染，可用作元数据）
   */
  startDate?: string;
  /**
   * 项目结束日期（暂未直接渲染，可用作元数据）
   */
  endDate?: string;
  [k: string]: unknown;
}
/**
 * 项目描述的一个小节
 */
export interface WorkProjectSection {
  /**
   * 小节标题，如 “主要职责” / “产出成果”
   */
  type: string;
  mode?: DisplayMode;
  /**
   * 小节内容条目，每条会渲染为列表项。可用 “前缀: 内容” 让前缀加粗。需要单条 mode 控制时，把对应整段改成 { text, mode } 对象数组
   */
  content: (
    | string
    | {
        /**
         * 条目文本内容，渲染规则等同于 string 形式
         */
        text: string;
        mode?: DisplayMode;
        [k: string]: unknown;
      }
  )[];
  [k: string]: unknown;
}
/**
 * 开源项目条目
 */
export interface OpenSourceProject {
  /**
   * 仓库标识，建议 “owner/repo”（元数据用）
   */
  name?: string;
  mode?: DisplayMode;
  /**
   * 页面上展示的名称
   */
  displayName: string;
  /**
   * 项目简介，会渲染在标题下方
   */
  summary?: string;
  /**
   * 项目主页（暂未直接渲染，可用作元数据）
   */
  website?: string;
  /**
   * GitHub 仓库地址，会作为标题的跳转链接
   */
  githubUrl: string;
  /**
   * 主要技术栈或语言（暂未直接渲染，可用作元数据）
   */
  primaryLanguage?: string;
  [k: string]: unknown;
}
/**
 * 其他/杂项小项目条目（轻量级，不分段描述）
 */
export interface MiscProject {
  /**
   * 项目名称
   */
  projectName: string;
  /**
   * 一句话项目描述
   */
  summary: string;
  /**
   * 技术栈标签，沿用 workProject 的 workSkill 习惯
   */
  workSkill?: string[];
  /**
   * 可选的项目链接（GitHub / Demo / 文章）。提供时项目名将渲染为可点击链接
   */
  url?: string;
  [k: string]: unknown;
}
/**
 * 教育经历条目
 */
export interface Education {
  /**
   * 学历与专业，如 “本科·软件工程”
   */
  studyType?: string;
  /**
   * 学校所在地
   */
  area?: string;
  /**
   * 学校名称
   */
  institution: string;
  /**
   * 入学日期，格式建议 YYYY-MM
   */
  startDate?: string;
  /**
   * 毕业日期，格式建议 YYYY-MM
   */
  endDate?: string;
  [k: string]: unknown;
}
