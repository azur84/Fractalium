import { createCipheriv, createDecipheriv, randomBytes } from "crypto"
import { readFileSync, writeFileSync } from "fs"

const algorithm = 'aes-256-cbc'
const key = process.env.ENCRYPTION_KEY!
const iv = randomBytes(16)

function encrypt(text: string) {
    const cipher = createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return { data: encrypted, iv: iv.toString('hex') }
}

function decrypt(encrypted: string, iv: Buffer<ArrayBufferLike>): string {
    const decipher = createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

export function readEncryptedJsonFile(filePath: string): any {
    const jsonContent = JSON.parse(readFileSync(filePath, 'utf8'))
    const decryptedContent = decrypt(jsonContent.data, Buffer.from(jsonContent.iv,"hex"))
    return JSON.parse(decryptedContent)
}

export function writeEncryptedJsonFile(filePath: string, content: any): void {
    const cryptedContent = encrypt(JSON.stringify(content))
    writeFileSync(filePath, JSON.stringify(cryptedContent))
}