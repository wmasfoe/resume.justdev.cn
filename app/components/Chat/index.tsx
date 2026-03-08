"use client";
import type { FC } from "react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import produce, { setAutoFreeze } from "immer";
import { useBoolean, useGetState } from "ahooks";
import { useSharedState } from "../common";
import styles from "./floating.module.css";
import ChatInput from "./ui/ChatInput";
import { CloseIcon } from "./ui/Icons";
import useUIState from "./hooks/useUIState";
import useVisualViewport from "./hooks/useVisualViewport";
import useBreakpoints, { MediaType } from "@/hooks/use-breakpoints";
import {
  checkCanSend,
  generateNewChatListWithOpenStatement,
} from "./utils/chatHelpers";
import type {
  ChatItem,
  ConversationItem,
  Feedbacktype,
  PromptConfig,
  VisionFile,
  VisionSettings,
} from "@/types/app";
import { Resolution, TransferMethod, WorkflowRunningStatus } from "@/types/app";
import type { Annotation as AnnotationType } from "@/types/log";
import useConversation from "@/hooks/use-conversation";
import Toast from "@/app/components/base/toast";
import Loading from "@/app/components/base/loading";
import { userInputsFormToPromptVariables } from "@/utils/prompt";
import { API_KEY, APP_ID, APP_INFO, promptTemplate } from "@/config";
import { addFileInfos, sortAgentSorts } from "@/utils/tools";
import {
  fetchAppParams,
  fetchChatList,
  fetchConversations,
  generationConversationName,
  sendChatMessage,
  updateFeedback,
} from "@/service";
import ChatCore from "@/app/components/Chat/ChatCore";

export type IMainProps = {
  query?: string;
  className?: string;
  // Ask component mode - shows floating UI
  isFloatingMode?: boolean;
};

const Main: FC<IMainProps> = ({
  query = "",
  className,
  isFloatingMode = false,
}) => {
  const hasSetAppConfig = APP_ID && API_KEY;

  // UI state for floating mode
  const uiState = useUIState();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { offsetBottom } = useVisualViewport();
  const media = useBreakpoints();
  const isMobile = [MediaType.mobile, MediaType.tablet].includes(media);

  /*
   * 应用信息
   */
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false);
  const [, setIsUnknownReason] = useState<boolean>(false);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [inited, setInited] = useState<boolean>(false);
  // 在移动端，通过点击按钮显示侧边栏
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  });

  useEffect(() => {
    if (APP_INFO?.title) document.title = `${APP_INFO.title}`;
  }, []);

  // 当数据改变时更新思维（produce对象）。https://github.com/immerjs/immer/issues/576
  useEffect(() => {
    setAutoFreeze(false);
    return () => {
      setAutoFreeze(true);
    };
  }, []);

  /*
   * conversation info
   */
  const {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation,
    currConversationInfo,
    currInputs,
    newConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    setNewConversationInfo,
    setExistConversationInfo,
  } = useConversation();

  /*
   * 聊天信息。聊天从属于会话。
   */
  const [chatList, setChatList, getChatList] = useGetState<ChatItem[]>([]);
  const [
    conversationIdChangeBecauseOfNew,
    setConversationIdChangeBecauseOfNew,
    getConversationIdChangeBecauseOfNew,
  ] = useGetState(false);
  const [isChatStarted, { setFalse: setChatNotStarted }] = useBoolean(false);
  // 开始新的聊天
  // const handleStartChat = (inputs: Record<string, any>) => {
  //   createNewChat()
  //   setConversationIdChangeBecauseOfNew(true)
  //   setCurrInputs(inputs)
  //   setChatStarted()
  //   // parse variables in introduction
  //   setChatList(generateNewChatListWithOpenStatement('', inputs))
  // }
  // const conversationIntroduction = currConversationInfo?.introduction || ''
  const [isResponding, setSharedResponding] = useSharedState(false);

  // Use ref to track last updated conversation to avoid unnecessary updates
  const lastUpdatedConversationId = useRef<string>("");
  const lastConversationMode = useRef<boolean>(false); // false for existing, true for new

  // Handle conversation input updates when conversation switches
  useEffect(() => {
    if (!inited) return;

    // Avoid duplicate updates
    if (
      lastUpdatedConversationId.current === currConversationId &&
      lastConversationMode.current === isNewConversation
    )
      return;

    lastUpdatedConversationId.current = currConversationId;
    lastConversationMode.current = isNewConversation;

    if (!isNewConversation) {
      const item = conversationList.find(
        (item) => item.id === currConversationId
      );
      const inputs = item?.inputs || {};
      setCurrInputs(inputs as any);
      setExistConversationInfo({
        name: item?.name || "",
        introduction: item?.introduction || "",
      });
    } else {
      setCurrInputs(newConversationInputs);
    }
  }, [
    inited,
    isNewConversation,
    conversationList,
    currConversationId,
    newConversationInputs,
    setCurrInputs,
    setExistConversationInfo,
  ]);

  // Use ref to track the last processed conversation to avoid infinite loops
  const lastProcessedConversationId = useRef<string>("");
  const hasFetchedChatList = useRef<boolean>(false);

  // Handle chat list loading when conversation switches (only for existing conversations)
  useEffect(() => {
    if (
      !inited ||
      isNewConversation ||
      conversationIdChangeBecauseOfNew ||
      isResponding
    )
      return;

    // Avoid duplicate fetches for the same conversation
    if (
      lastProcessedConversationId.current === currConversationId &&
      hasFetchedChatList.current
    )
      return;

    const currentConversation = conversationList.find(
      (item) => item.id === currConversationId
    );
    if (!currentConversation) return;

    lastProcessedConversationId.current = currConversationId;
    hasFetchedChatList.current = true;

    fetchChatList(currConversationId).then((res: any) => {
      const { data } = res;
      const introduction = currentConversation.introduction || "";
      const inputs = currentConversation.inputs || {};

      const newChatList: ChatItem[] = generateNewChatListWithOpenStatement(
        introduction,
        inputs,
        introduction,
        inputs,
        promptConfig
      );

      data.forEach((item: any) => {
        newChatList.push({
          id: `question-${item.id}`,
          content: item.query,
          isAnswer: false,
          message_files:
            item.message_files?.filter(
              (file: any) => file.belongs_to === "user"
            ) || [],
        });
        newChatList.push({
          id: item.id,
          content: item.answer,
          agent_thoughts: addFileInfos(
            item.agent_thoughts
              ? sortAgentSorts(item.agent_thoughts)
              : item.agent_thoughts,
            item.message_files
          ),
          feedback: item.feedback,
          isAnswer: true,
          message_files:
            item.message_files?.filter(
              (file: any) => file.belongs_to === "assistant"
            ) || [],
        });
      });
      setChatList(newChatList);
    });
  }, [
    inited,
    isNewConversation,
    currConversationId,
    conversationIdChangeBecauseOfNew,
    isResponding,
    promptConfig,
  ]);

  // Handle new conversation chat list initialization
  useEffect(() => {
    if (!isNewConversation || !isChatStarted || !promptConfig) return;

    // Reset the tracking refs for new conversations
    lastProcessedConversationId.current = "";
    hasFetchedChatList.current = false;

    const introduction = currConversationInfo?.introduction || "";
    setChatList(
      generateNewChatListWithOpenStatement(
        "",
        null,
        introduction,
        currInputs,
        promptConfig
      )
    );
  }, [
    isNewConversation,
    isChatStarted,
    currConversationInfo,
    currInputs,
    promptConfig,
    setChatList,
  ]);

  // 如果用户已发送消息，则不能编辑输入
  // const createNewChat = useCallback(() => {
  //   // 如果新聊天已存在，不要创建新聊天
  //   if (conversationList.some(item => item.id === '-1'))
  //     return

  //   setConversationList(produce(conversationList, (draft) => {
  //     draft.unshift({
  //       id: '-1',
  //       name: '新的对话',
  //       inputs: newConversationInputs,
  //       introduction: conversationIntroduction,
  //     })
  //   }))
  // }, [conversationList, setConversationList, newConversationInputs, conversationIntroduction])
  const updateCurrentQA = useCallback(
    ({
      responseItem,
      questionId,
      placeholderAnswerId,
      questionItem,
    }: {
      responseItem: ChatItem;
      questionId: string;
      placeholderAnswerId: string;
      questionItem: ChatItem;
    }) => {
      // 闭包中的新列表已过时
      const newListWithAnswer = produce(
        getChatList().filter(
          (item) =>
            item.id !== responseItem.id && item.id !== placeholderAnswerId
        ),
        (draft) => {
          if (!draft.find((item) => item.id === questionId))
            draft.push({ ...questionItem });

          draft.push({ ...responseItem });
        }
      );
      setChatList(newListWithAnswer);
    },
    [getChatList, setChatList]
  );

  // 核心初始化逻辑：提取为独立函数，消除useEffect依赖
  const initializeApp = useCallback(async () => {
    try {
      const [conversationData, appParams] = await Promise.all([
        fetchConversations(),
        fetchAppParams(),
      ]);

      // 数据验证：统一错误处理
      const { data: conversations, error } = conversationData as {
        data: ConversationItem[];
        error: string;
      };
      if (error) {
        Toast.notify({ type: "error", message: error });
        throw new Error(error);
      }

      // 会话ID处理：简化逻辑
      const storedConversationId = getConversationIdFromStorage(APP_ID);
      const shouldRestoreConversation = conversations.some(
        (item) => item.id === storedConversationId
      );

      // 配置设置：批量更新状态（减少重渲染）
      const {
        user_input_form,
        opening_statement,
        file_upload,
        system_parameters,
      } = appParams as {
        user_input_form: any;
        opening_statement: string;
        file_upload: any;
        system_parameters: any;
      };

      // 批量状态更新：一次性设置所有配置
      const prompt_variables = userInputsFormToPromptVariables(user_input_form);

      setNewConversationInfo({
        name: "新的对话",
        introduction: opening_statement,
      });

      setPromptConfig({
        prompt_template: promptTemplate,
        prompt_variables,
      } as PromptConfig);

      setVisionConfig({
        ...file_upload?.image,
        image_file_size_limit: system_parameters?.system_parameters || 0,
      });

      setConversationList(conversations as ConversationItem[]);

      // 恢复会话：简化条件逻辑
      if (shouldRestoreConversation) {
        setCurrConversationId(storedConversationId, APP_ID, false);
      }

      setInited(true);
    } catch (e: any) {
      // 错误处理：消除特殊情况
      const is404Error = e.status === 404;
      setAppUnavailable(true);
      if (!is404Error) setIsUnknownReason(true);
    }
  }, [
    fetchConversations,
    fetchAppParams,
    getConversationIdFromStorage,
    setCurrConversationId,
    setNewConversationInfo,
    setPromptConfig,
    setVisionConfig,
    setConversationList,
    setInited,
    setAppUnavailable,
    setIsUnknownReason,
  ]);

  // 初始化状态机：只依赖配置状态，不依赖任何setter
  useEffect(() => {
    if (!hasSetAppConfig) {
      setAppUnavailable(true);
      return;
    }

    // 单一职责：只负责启动初始化流程
    initializeApp();
  }, [hasSetAppConfig]); // 只依赖配置状态

  const setRespondingTrue = useCallback(
    () => setSharedResponding(true),
    [setSharedResponding]
  );
  const setRespondingFalse = useCallback(
    () => setSharedResponding(false),
    [setSharedResponding]
  );
  // const [isResponding, { setTrue: setRespondingTrue, setFalse: setRespondingFalse }] = useBoolean(false)
  const [, setAbortController] = useState<AbortController | null>(null);
  const { notify } = Toast;

  // Message validation and sending
  const logError = useCallback(
    (message: string) => {
      notify({ type: "error", message });
    },
    [notify]
  );

  const handleCanSend = useCallback(() => {
    return checkCanSend(currConversationId, currInputs, promptConfig, logError);
  }, [currConversationId, currInputs, promptConfig, logError]);

  const [, setMessageTaskId] = useState("");
  const [, setIsRespondingConCurrCon] = useGetState(true);

  const handleSend = useCallback(
    async (message: string, files?: VisionFile[]) => {
      if (isResponding) {
        notify({ type: "info", message: "请等待上条信息响应完成" });
        return;
      }
      const data: Record<string, any> = {
        inputs: currInputs || {},
        query: message || query,
        conversation_id: isNewConversation ? null : currConversationId,
      };

      if (visionConfig?.enabled && files && files?.length > 0) {
        data.files = files.map((item) => {
          if (item.transfer_method === TransferMethod.local_file) {
            return {
              ...item,
              url: "",
            };
          }
          return item;
        });
      }

      // question
      const questionId = `question-${Date.now()}`;
      const questionItem = {
        id: questionId,
        content: message || query,
        isAnswer: false,
        message_files: files,
      };

      const placeholderAnswerId = `answer-placeholder-${Date.now()}`;
      const placeholderAnswerItem = {
        id: placeholderAnswerId,
        content: "",
        isAnswer: true,
      };

      const newList = [...getChatList(), questionItem, placeholderAnswerItem];
      setChatList(newList);

      let isAgentMode = false;

      // answer
      const responseItem: ChatItem = {
        id: `${Date.now()}`,
        content: "",
        agent_thoughts: [],
        message_files: [],
        isAnswer: true,
      };
      let hasSetResponseId = false;

      const prevTempNewConversationId = getCurrConversationId() || "-1";
      let tempNewConversationId = "";

      setRespondingTrue();
      sendChatMessage(data, {
        getAbortController: (abortController) => {
          setAbortController(abortController);
        },
        onData: (
          message: string,
          isFirstMessage: boolean,
          { conversationId: newConversationId, messageId, taskId }: any
        ) => {
          if (!isAgentMode) {
            responseItem.content = responseItem.content + message;
          } else {
            const lastThought =
              responseItem.agent_thoughts?.[
                responseItem.agent_thoughts?.length - 1
              ];
            if (lastThought)
              lastThought.thought = lastThought.thought + message; // need immer setAutoFreeze
          }
          if (messageId && !hasSetResponseId) {
            responseItem.id = messageId;
            hasSetResponseId = true;
          }

          if (isFirstMessage && newConversationId)
            tempNewConversationId = newConversationId;

          setMessageTaskId(taskId);
          // has switched to other conversation
          if (prevTempNewConversationId !== getCurrConversationId()) {
            setIsRespondingConCurrCon(false);
            return;
          }
          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          });
        },
        async onCompleted(hasError?: boolean) {
          if (hasError) return;

          if (getConversationIdChangeBecauseOfNew()) {
            const { data: allConversations }: any = await fetchConversations();
            const newItem: any = await generationConversationName(
              allConversations[0].id
            );

            const newAllConversations = produce(
              allConversations,
              (draft: any) => {
                draft[0].name = newItem.name;
              }
            );
            setConversationList(newAllConversations as any);
          }
          setConversationIdChangeBecauseOfNew(false);
          resetNewConversationInputs();
          setChatNotStarted();
          setCurrConversationId(tempNewConversationId, APP_ID, true);
          setRespondingFalse();
        },
        onFile(file) {
          const lastThought =
            responseItem.agent_thoughts?.[
              responseItem.agent_thoughts?.length - 1
            ];
          if (lastThought)
            lastThought.message_files = [
              ...(lastThought as any).message_files,
              { ...file },
            ];

          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          });
        },
        onThought(thought) {
          isAgentMode = true;
          const response = responseItem as any;
          if (thought.message_id && !hasSetResponseId) {
            response.id = thought.message_id;
            hasSetResponseId = true;
          }
          // responseItem.id = thought.message_id;
          if (response.agent_thoughts.length === 0) {
            response.agent_thoughts.push(thought);
          } else {
            const lastThought =
              response.agent_thoughts[response.agent_thoughts.length - 1];
            // thought changed but still the same thought, so update.
            if (lastThought.id === thought.id) {
              thought.thought = lastThought.thought;
              thought.message_files = lastThought.message_files;
              responseItem.agent_thoughts![response.agent_thoughts.length - 1] =
                thought;
            } else {
              responseItem.agent_thoughts!.push(thought);
            }
          }
          // has switched to other conversation
          if (prevTempNewConversationId !== getCurrConversationId()) {
            setIsRespondingConCurrCon(false);
            return false;
          }

          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          });
        },
        onMessageEnd: (messageEnd) => {
          if (messageEnd.metadata?.annotation_reply) {
            responseItem.id = messageEnd.id;
            responseItem.annotation = {
              id: messageEnd.metadata.annotation_reply.id,
              authorName: messageEnd.metadata.annotation_reply.account.name,
            } as AnnotationType;
            const newListWithAnswer = produce(
              getChatList().filter(
                (item) =>
                  item.id !== responseItem.id && item.id !== placeholderAnswerId
              ),
              (draft) => {
                if (!draft.find((item) => item.id === questionId))
                  draft.push({ ...questionItem });

                draft.push({
                  ...responseItem,
                });
              }
            );
            setChatList(newListWithAnswer);
            return;
          }
          // 不支持显示引用
          // responseItem.citation = messageEnd.retriever_resources
          const newListWithAnswer = produce(
            getChatList().filter(
              (item) =>
                item.id !== responseItem.id && item.id !== placeholderAnswerId
            ),
            (draft) => {
              if (!draft.find((item) => item.id === questionId))
                draft.push({ ...questionItem });

              draft.push({ ...responseItem });
            }
          );
          setChatList(newListWithAnswer);
        },
        onMessageReplace: (messageReplace) => {
          setChatList(
            produce(getChatList(), (draft) => {
              const current = draft.find(
                (item) => item.id === messageReplace.id
              );

              if (current) current.content = messageReplace.answer;
            })
          );
        },
        onError() {
          setRespondingFalse();
          // 回滚占位符答案
          setChatList(
            produce(getChatList(), (draft) => {
              draft.splice(
                draft.findIndex((item) => item.id === placeholderAnswerId),
                1
              );
            })
          );
        },
        onWorkflowStarted: ({ workflow_run_id }) => {
          // 设置任务ID引用
          // taskIdRef.current = task_id
          responseItem.workflow_run_id = workflow_run_id;
          responseItem.workflowProcess = {
            status: WorkflowRunningStatus.Running,
            tracing: [],
          };
          setChatList(
            produce(getChatList(), (draft) => {
              const currentIndex = draft.findIndex(
                (item) => item.id === responseItem.id
              );
              draft[currentIndex] = {
                ...draft[currentIndex],
                ...responseItem,
              };
            })
          );
        },
        onWorkflowFinished: ({ data }) => {
          responseItem.workflowProcess!.status =
            data.status as WorkflowRunningStatus;
          setChatList(
            produce(getChatList(), (draft) => {
              const currentIndex = draft.findIndex(
                (item) => item.id === responseItem.id
              );
              draft[currentIndex] = {
                ...draft[currentIndex],
                ...responseItem,
              };
            })
          );
        },
        onNodeStarted: ({ data }) => {
          responseItem.workflowProcess!.tracing!.push(data as any);
          setChatList(
            produce(getChatList(), (draft) => {
              const currentIndex = draft.findIndex(
                (item) => item.id === responseItem.id
              );
              draft[currentIndex] = {
                ...draft[currentIndex],
                ...responseItem,
              };
            })
          );
        },
        onNodeFinished: ({ data }) => {
          const currentIndex = responseItem.workflowProcess!.tracing!.findIndex(
            (item) => item.node_id === data.node_id
          );
          responseItem.workflowProcess!.tracing[currentIndex] = data as any;
          setChatList(
            produce(getChatList(), (draft) => {
              const currentIndex = draft.findIndex(
                (item) => item.id === responseItem.id
              );
              draft[currentIndex] = {
                ...draft[currentIndex],
                ...responseItem,
              };
            })
          );
        },
      });
    },
    [
      isResponding,
      notify,
      currInputs,
      query,
      isNewConversation,
      currConversationId,
      visionConfig,
      getChatList,
      setChatList,
      setRespondingTrue,
      updateCurrentQA,
      getConversationIdChangeBecauseOfNew,
      setConversationIdChangeBecauseOfNew,
      resetNewConversationInputs,
      setChatNotStarted,
      setCurrConversationId,
      setConversationList,
      setAbortController,
      setMessageTaskId,
      setIsRespondingConCurrCon,
      getCurrConversationId,
      setRespondingFalse,
    ]
  );

  const handleFeedback = useCallback(
    async (messageId: string, feedback: Feedbacktype) => {
      await updateFeedback({
        url: `/messages/${messageId}/feedbacks`,
        body: { rating: feedback.rating },
      });
      const newChatList = chatList.map((item) => {
        if (item.id === messageId) {
          return {
            ...item,
            feedback,
          };
        }
        return item;
      });
      setChatList(newChatList);
      notify({ type: "success", message: "成功" });
    },
    [chatList, setChatList, notify]
  );

  // Floating mode UI
  const handleFloatingSend = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      uiState.setMessage("");
      handleSend(message);
    },
    [uiState, handleSend]
  );

  // Handle click outside to collapse floating mode
  useEffect(() => {
    if (!isFloatingMode || !uiState.isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        uiState.handleCollapse();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFloatingMode, uiState.isExpanded, uiState.handleCollapse]);

  // TODO 暂时去掉，后续需要加入挂载失败重试功能
  // if (appUnavailable)
  //   return <AppUnavailable isUnknownReason={isUnknownReason} errMessage={!hasSetAppConfig ? 'Please set APP_ID and API_KEY in config/index.tsx' : ''} />

  if (!APP_ID || !APP_INFO || !promptConfig || appUnavailable)
    return <Loading type="app" />;

  if (isFloatingMode) {
    const isOpen = uiState.isExpanded;
    const isClosing = uiState.isClosing;

    // Determine chat content animation class
    const chatAnimClass = isClosing
      ? styles.chatContainerClosing
      : isOpen
      ? styles.chatContainerVisible
      : "";

    const inputExpanded = isOpen;

    // Push panel above keyboard on mobile when keyboard is open
    const mobileBottomStyle =
      isMobile && isOpen && offsetBottom > 0
        ? { bottom: `${offsetBottom + 8}px` }
        : undefined;

    return (
      <div className={`${styles.variables} ${className ?? ""}`}>
        <div
          ref={chatContainerRef}
          className={`${styles.inputContainer} ${
            isOpen || isClosing ? "" : styles.hoverScale
          }`}
          style={mobileBottomStyle}
          onClick={uiState.handleFocus}
        >
          {/* Drag handle — CSS hides on desktop, shows on mobile */}
          <div className={styles.drawerHandle} />

          {/* Close button — animates in after panel opens */}
          {isOpen && (
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation();
                uiState.handleCollapse();
              }}
              aria-label="关闭"
            >
              <CloseIcon />
            </button>
          )}

          {/* Chat content — always in DOM, animated by CSS */}
          <div className={`${styles.chatContainer} ${chatAnimClass}`}>
            <div className={`${styles.chatWrapper} relative h-[500px]`}>
              <ChatCore
                chatList={chatList}
                onSend={handleSend}
                onFeedback={handleFeedback}
                isResponding={isResponding}
                checkCanSend={handleCanSend}
                visionConfig={visionConfig}
                isHideSendInput
              />
            </div>
          </div>

          <ChatInput
            ref={uiState.inputRef}
            message={uiState.message}
            isExpanded={inputExpanded}
            isResponding={isResponding}
            onMessageChange={uiState.setMessage}
            onSend={handleFloatingSend}
            onFocus={uiState.handleFocus}
          />
        </div>
      </div>
    );
  }

  // Regular mode UI
  return (
    <div className={className}>
      <ChatCore
        chatList={chatList}
        onSend={handleSend}
        onFeedback={handleFeedback}
        isResponding={isResponding}
        checkCanSend={handleCanSend}
        visionConfig={visionConfig}
      />
    </div>
  );
};

export default React.memo(Main);
