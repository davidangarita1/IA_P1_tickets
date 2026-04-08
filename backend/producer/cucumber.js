// ⚕️ HUMAN CHECK - Configuración de Cucumber para pruebas de aceptación (Caja Negra)
// Usa ts-node para ejecutar steps en TypeScript directamente

module.exports = {
    default: {
        // Ubicación de los .feature
        paths: ['test/acceptance/features/**/*.feature'],
        // Step definitions en TypeScript
        requireModule: ['ts-node/register', 'tsconfig-paths/register'],
        require: ['test/acceptance/steps/**/*.steps.ts'],
        // Formato de salida legible
        format: ['progress-bar', 'html:coverage/acceptance-report.html'],
        // Lenguaje por defecto
        language: 'en',
    },
};
