class Camera {
    constructor(){
        this.fov = 60.0
        this.movementSpeed = 0.2;
        this.alpha = 1;

        this.eye = new Vector3([18, 4, -17]);
        this.at = new Vector3([-19000, -6, 7864]);
        this.up = new Vector3([0, 1, 0]);

        this.projectionMatrix = new Matrix4();        
        this.viewMatrix = new Matrix4();        
        this.updateView();
    }

    updateView() {
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, this.projectionMatrix.elements);

        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]); // (eye, at, up)
        gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMatrix.elements);
    }

    moveUp() {
        var movement = new Vector3(this.up.elements); // Get the up vector
        movement.normalize();
        movement.mul(this.movementSpeed);
        
        this.eye.add(movement);
        this.at.add(movement);
    }
    
    moveDown() {
        var movement = new Vector3(this.up.elements); // Get the up vector
        movement.normalize();
        movement.mul(this.movementSpeed);
        
        this.eye.sub(movement);
        this.at.sub(movement);
    }    

    moveForward() {
        var distance = new Vector3(this.at.elements);
        distance.sub(this.eye);
        distance.normalize();
        distance.mul(this.movementSpeed);
        this.eye.add(distance);
        this.at.add(distance);
    }

    moveBackward() {
        var distance = new Vector3(this.eye.elements);
        distance.sub(this.at);
        distance.normalize();
        distance.mul(this.movementSpeed);
        this.eye.add(distance);
        this.at.add(distance);
    }

    moveLeft() {
        var distance = new Vector3(this.at.elements);
        distance.sub(this.eye);
        var side = Vector3.cross(this.up, distance);
        side.normalize();
        side.mul(this.movementSpeed);
        this.eye.add(side);
        this.at.add(side);
    }

    moveRight() {
        var distance = new Vector3(this.at.elements);
        distance.sub(this.eye);
        var side = Vector3.cross(distance, this.up);
        side.normalize();
        side.mul(this.movementSpeed);
        this.eye.add(side);
        this.at.add(side);
    }

    panLeft( angle = this.alpha ) {
        var distance = new Vector3(this.at.elements);
        distance.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var distancePrime = rotationMatrix.multiplyVector3(distance);
        this.at.set(this.eye);
        this.at.add(distancePrime);

        //console.log(this.eye.elements, this.at.elements, this.up.elements);
    }

    panRight( angle = this.alpha ) {
        var distance = new Vector3(this.at.elements);
        distance.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var distancePrime = rotationMatrix.multiplyVector3(distance);
        this.at.set(this.eye);
        this.at.add(distancePrime);
    }
}
