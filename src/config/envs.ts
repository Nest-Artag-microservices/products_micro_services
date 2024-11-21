import 'dotenv/config';
import Joi, * as joi from 'joi';

interface EnvConfig {
    PORT: number;
    DATABASE_URL: string;

    NATS_SERVERS: string[];
}

const envVarsSchema = joi.object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items( joi.string() ).required(),
})
.unknown(true);

const { error, value} = envVarsSchema.validate(
    {...process.env,
        NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
}
);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvConfig = value;

export const envs={
port: envVars.PORT,
database_url: envVars.DATABASE_URL,
nats_servers: envVars.NATS_SERVERS

}