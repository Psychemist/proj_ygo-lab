import { NextFunction, Request, Response } from "express";

// devMode
// return req.session['user'] = {
//     id: 80,
//     username: 'dawwd',
//     password: '$2a$10$Gy6C7OPSNPE.GSm3onifX.znodKiaXYqoDdW3uss8uHEVUf9GdvHi',
//     cash: 5000,
//     isactive: true
// }

export function isLoggedIn(req: Request, res: Response, next: NextFunction) {

    if (req.session && req.session['user'] && Object.keys(req.session['user']).length > 0) {
        next()
    } else {
        res.status(403).redirect('/login.html')
    }
}


// admin login guard
export function adminLoggedIn(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session['user'] && Object.keys(req.session['user']).length > 0) {
        next()
    } else {
        res.status(403).redirect('/login.html')
    }
}