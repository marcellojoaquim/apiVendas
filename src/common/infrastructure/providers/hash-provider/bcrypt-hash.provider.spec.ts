import { BcryptjsHashProvider } from './bcryptjs-hash.provider';

describe('BcryptjsHashProvider Unit Tests', () => {
  let sut: BcryptjsHashProvider;

  beforeEach(() => {
    sut = new BcryptjsHashProvider();
  });

  it('Should return encrypted password', async () => {
    const password = 'testPassword';
    const hash = await sut.generateHash(password);
    expect(hash).toBeDefined();
  });

  it('Should return false when invalid password argument is used', async () => {
    const password = 'TestPassword123';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash('inalidPassword', hash);
    expect(result).toBeFalsy();
  });

  it('Should return true when valid passord argument is used', async () => {
    const password = 'TestPassword123';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash(password, hash);
    expect(result).toBeTruthy();
  });
});
