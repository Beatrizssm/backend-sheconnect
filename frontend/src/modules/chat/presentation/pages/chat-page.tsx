import { motion } from 'motion/react';
import { useAppControllerContext } from '../../../app-shell/application/use-app-controller';
import { cn } from '../../../../shared/lib/cn';
import { formatTime, getShortId } from '../../../../shared/utils/date.utils';
import { ArrowLeft, Search, Bell, Settings, Apple, Rocket } from 'lucide-react';

export function ChatPage() {
  const {
    activeChatId,
    setActiveChatId,
    messageText,
    setMessageText,
    conversations,
    chatMessages,
    isLoadingConversations,
    isLoadingMessages,
    chatError,
    authUser,
    activeConversation,
    participantNames,
    handleSendChatMessage,
    handleSelectChat,
  } = useAppControllerContext();

  const showConversationList = !activeChatId;
  const otherUserId =
    activeConversation?.participantIds.find((participantId) => participantId !== authUser.id) ?? '';
  const activeDisplayName =
    participantNames.get(otherUserId) ?? `Usuária ${getShortId(otherUserId)}`;

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex overflow-hidden font-sans"
    >
      <div
        className={cn(
          'w-full lg:w-80 lg:shrink-0 bg-white border-r border-outline-variant/30 flex flex-col',
          !showConversationList && 'hidden lg:flex',
        )}
      >
        <div className="p-4 sm:p-6 border-b border-outline-variant/10">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Mensagens</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
            <input
              placeholder="Buscar conversas..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {isLoadingConversations && (
            <div className="p-4 sm:p-6 text-sm font-bold text-on-surface-variant/60">Carregando conversas...</div>
          )}
          {!isLoadingConversations && conversations.length === 0 && (
            <div className="p-4 sm:p-6 text-sm font-bold text-on-surface-variant/60">Nenhuma conversa ainda.</div>
          )}
          {conversations.map((conv) => {
            const convOtherUserId =
              conv.participantIds.find((participantId) => participantId !== authUser.id) ?? conv.participantIds[0];
            const displayName = participantNames.get(convOtherUserId) ?? `Usuária ${getShortId(convOtherUserId)}`;

            return (
              <button
                key={conv.conversationId}
                onClick={() => handleSelectChat(conv.conversationId)}
                className={cn(
                  'w-full p-4 flex items-center gap-4 transition-all border-b border-outline-variant/5',
                  activeChatId === conv.conversationId ? 'bg-primary/5' : 'hover:bg-surface-container-low',
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">
                    {displayName.slice(0, 1)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-grow min-w-0 text-left">
                  <div className="flex justify-between items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-on-surface truncate">{displayName}</span>
                    <span className="text-[10px] text-on-surface-variant/60 font-medium shrink-0">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/60 font-medium truncate">{conv.lastMessage.message}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          'flex-grow flex flex-col bg-white min-w-0',
          showConversationList && 'hidden lg:flex',
        )}
      >
        {activeChatId ? (
          <div className="p-4 sm:p-6 border-b border-outline-variant/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setActiveChatId('')}
                aria-label="Voltar para conversas"
                className="p-2 rounded-xl hover:bg-surface-container-low text-on-surface-variant lg:hidden shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0">
                {activeDisplayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold truncate">{activeDisplayName}</h3>
                <p className="text-xs text-green-500 font-bold">Realtime ativo</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                aria-label="Notificações da conversa"
                className="p-2 sm:p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Configurações da conversa"
                className="p-2 sm:p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex p-6 border-b border-outline-variant/10 items-center justify-center text-sm font-bold text-on-surface-variant/60">
            Selecione uma conversa para começar.
          </div>
        )}

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-container-low/20">
          {chatError && <p className="text-sm font-bold text-red-500">{chatError}</p>}
          {isLoadingMessages && (
            <p className="text-sm font-bold text-on-surface-variant/60">Carregando mensagens...</p>
          )}
          {!isLoadingMessages && activeChatId && chatMessages.length === 0 && (
            <p className="text-sm font-bold text-on-surface-variant/60">Nenhuma mensagem nesta conversa.</p>
          )}
          {!activeChatId && (
            <p className="lg:hidden text-sm font-bold text-on-surface-variant/60 text-center py-8">
              Selecione uma conversa acima para começar.
            </p>
          )}
          {chatMessages.map((msg) => {
            const isMe = msg.senderId === authUser.id;

            return (
              <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed',
                    isMe
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white text-on-surface rounded-tl-none border border-outline-variant/10',
                  )}
                >
                  {msg.message}
                  <p className="text-[10px] mt-1.5 font-bold opacity-60 text-right">{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 sm:p-6 border-t border-outline-variant/10">
          <div className="bg-surface-container-low rounded-2xl p-2 flex items-center gap-2 border border-outline-variant/10 focus-within:border-primary focus-within:bg-white transition-all">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleSendChatMessage();
                }
              }}
              placeholder="Digite sua mensagem..."
              disabled={!activeChatId}
              className="flex-grow min-w-0 bg-transparent px-3 sm:px-4 py-2 outline-none text-sm font-medium"
            />
            <button
              type="button"
              aria-label="Anexar"
              className="hidden sm:block p-2 rounded-xl text-on-surface-variant hover:text-primary shrink-0"
            >
              <Apple className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => void handleSendChatMessage()}
              disabled={!activeChatId || !messageText.trim()}
              aria-label="Enviar mensagem"
              className="bg-primary text-white p-2.5 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 shrink-0"
            >
              <Rocket className="w-5 h-5 rotate-45" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
