pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "mazenhammouda"
        BACKEND_IMAGE  = "locationvoiture-backend"
        FRONTEND_IMAGE = "locationvoiture-frontend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${DOCKERHUB_USER}/${BACKEND_IMAGE}", "backend")
                    docker.build("${DOCKERHUB_USER}/${FRONTEND_IMAGE}", "frontend")
                }
            }
        }

        stage('Security Scan with Trivy') {
            steps {
                sh '''
                trivy image ${DOCKERHUB_USER}/${BACKEND_IMAGE}
                trivy image ${DOCKERHUB_USER}/${FRONTEND_IMAGE}
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push ${DOCKERHUB_USER}/${BACKEND_IMAGE}
                    docker push ${DOCKERHUB_USER}/${FRONTEND_IMAGE}
                    '''
                }
            }
        }
    }
}
