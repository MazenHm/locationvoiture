pipeline {
    agent any

    stages {

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t mazenhammouda/locationvoiture-backend:latest .'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'docker build -t mazenhammouda/locationvoiture-frontend:latest .'
                }
            }
        }

    }
}
