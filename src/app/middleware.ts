import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const auth = context.req.headers.authorization;

    if (!auth) {
        context.res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Admin"' });
        context.res.end('Authentication required');
        return { props: {} };
    }

    const base64Credentials = auth.split(' ')[1];
    const [username, password] = Buffer.from(base64Credentials, 'base64')
        .toString()
        .split(':');

    const validUsername = 'admin';
    const validPassword = '123456';

    if (username !== validUsername || password !== validPassword) {
        context.res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Admin"' });
        context.res.end('Access denied');
        return { props: {} };
    }

    return { props: {} }; // authorized
};

