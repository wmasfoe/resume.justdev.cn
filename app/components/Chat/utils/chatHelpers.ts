import type { PromptConfig } from '@/types/app'
import { replaceVarWithValues } from '@/utils/prompt'
import { isShowPrompt } from '@/config'

export const checkCanSend = (
  currConversationId: string,
  currInputs: Record<string, any> | null,
  promptConfig: PromptConfig | null,
  logError: (message: string) => void,
): boolean => {
  if (currConversationId !== '-1')
    return true

  if (!currInputs || !promptConfig?.prompt_variables)
    return true

  const inputLens = Object.values(currInputs).length
  const promptVariablesLens = promptConfig.prompt_variables.length

  const emptyInput = inputLens < promptVariablesLens || Object.values(currInputs).find(v => !v)
  if (emptyInput) {
    logError('变量值必填')
    return false
  }
  return true
}

export const generateNewChatListWithOpenStatement = (
  introduction: string,
  inputs: Record<string, any> | null,
  conversationIntroduction: string,
  currInputs: Record<string, any> | null,
  promptConfig: PromptConfig | null,
) => {
  let calculatedIntroduction = introduction || conversationIntroduction || ''
  const calculatedPromptVariables = inputs || currInputs || null

  if (calculatedIntroduction && calculatedPromptVariables && promptConfig?.prompt_variables)
    calculatedIntroduction = replaceVarWithValues(calculatedIntroduction, promptConfig.prompt_variables, calculatedPromptVariables)

  const openStatement = {
    id: `${Date.now()}`,
    content: calculatedIntroduction,
    isAnswer: true,
    feedbackDisabled: true,
    isOpeningStatement: isShowPrompt,
  }

  if (calculatedIntroduction)
    return [openStatement]

  return []
}
