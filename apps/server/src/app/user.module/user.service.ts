import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

interface User {
  id: string; // Add id field
  username: string;
  password: string;
}

@Injectable()
export class UserService {
  private readonly usersFilePath = path.join(__dirname, 'users.json');
  private readonly jwtSecret = 'your-secret-key'; // Replace with a secure secret key

  constructor() {
    if (!fs.existsSync(this.usersFilePath)) {
      fs.writeFileSync(this.usersFilePath, JSON.stringify([]));
    }
  }

  private readUsers(): User[] {
    const data = fs.readFileSync(this.usersFilePath, 'utf-8');
    return JSON.parse(data);
  }

  private writeUsers(users: User[]): void {
    fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2));
  }

  private generateToken(id:string, username: string): string {
    return jwt.sign({ username, id }, this.jwtSecret, { expiresIn: '1h' });
  }

  validateToken(token: string): { isValid: true; username: string; id:string } | { isValid: false } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { username: string, id:string };
      return { isValid: true, username: decoded.username, id: decoded.id };
    } catch {
      return { isValid: false };
    }
  }

  signup(username: string, password: string): { id: string; username: string; token: string } {
    const users = this.readUsers();
    if (users.find(user => user.username === username)) {
      throw new BadRequestException('User already exists');
    }
    const id = uuidv4(); // Generate a unique ID
    users.push({ id, username, password });
    this.writeUsers(users);
    const token = this.generateToken(id, username);
    return { id, username, token };
  }

  signin(username: string, password: string): { id: string; username: string; token: string } {
    const users = this.readUsers();
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const token = this.generateToken(user.id, username);
    return { id: user.id, username, token }; // Include id in the response
  }
}
