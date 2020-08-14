import { mock, instance, verify } from 'ts-mockito';
import PingCommand from './ping';
import { Message, TextChannel } from 'eris';

const command = new PingCommand();

describe('ping', () => {
  it('replies with pong', async () => {
    const mockMessage = mock(Message);
    const mockChannel = mock(TextChannel);
    const message = instance(mockMessage);
    const channel = instance(mockChannel);
    message.channel = channel;

    await command.execute(message);
    verify(mockChannel.createMessage('Pong!')).called();
  })
})
