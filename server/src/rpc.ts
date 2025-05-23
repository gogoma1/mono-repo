// filepath: monorepo/server/src/rpc.ts
import { hc } from 'hono/client';
import type { AppType } from './index'; // 메인 Hono 앱의 타입 (server/src/index.ts 에서 export)

// hc의 제네릭으로 AppType을 전달하여, TypeScript가 클라이언트 객체의 타입을 "계산"하도록 합니다.
// 첫 번째 인자인 URL은 타입 계산 시에는 중요하지 않으므로 더미 URL을 사용합니다.
const tempClientForTypeInference = hc<AppType>('http://localhost.internal.dummy.url');

// 계산된 전체 RPC 클라이언트 객체의 타입을 export 합니다.
// 이것이 클라이언트에서 사용할 "구체화된" 전체 클라이언트 타입입니다.
export type HonoRpcClientType = typeof tempClientForTypeInference;

// 클라이언트에서 쉽게 사용할 수 있도록, 타입을 이미 적용한 hc 함수를 다시 export 합니다.
// Parameters<typeof hc> 는 hc 함수의 파라미터 타입을 가져옵니다 (주로 [baseURL, options?]).
// 반환 타입은 위에서 계산한 HonoRpcClientType으로 강제합니다.
export const createTypedHcClient = (...args: Parameters<typeof hc>): HonoRpcClientType => {
    // 내부적으로는 여전히 AppType으로 hc를 호출하여 실제 클라이언트를 생성합니다.
    // args[0]은 baseURL, args[1]은 options.
    // hc<AppType>으로 실제 클라이언트를 생성해야 RPC 기능이 제대로 동작합니다.
    // 반환 타입을 HonoRpcClientType으로 캐스팅하여 타입 검사 부담을 줄입니다.
    return hc<AppType>(args[0], args[1]) as HonoRpcClientType;
};

// 만약 특정 API 그룹 (예: 학생 관리)의 타입만 별도로 export 하고 싶다면:
export type StudentManagementApiClientType = typeof tempClientForTypeInference.manage.student;
// export type AuthApiClientType = typeof tempClientForTypeInference.auth;
// ... 등등